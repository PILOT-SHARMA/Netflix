const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const Media = require('../models/Media');
const cloudinary = require('../config/cloudinary');

// Use memory storage — files go to buffer, then we upload to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// Helper: upload a buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(fileBuffer);
  });
};

// Accept both video file and thumbnail image
const uploadFields = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

router.post('/upload', auth, uploadFields, async (req, res) => {
  try {
    const { title, description, type, category } = req.body;
    
    // Upload file to Cloudinary
    let fileUrl = '';
    if (req.files && req.files['file'] && req.files['file'][0]) {
      const resourceType = type === 'video' ? 'video' : 'image';
      const result = await uploadToCloudinary(req.files['file'][0].buffer, {
        folder: `netflix/${resourceType}s`,
        resource_type: resourceType,
      });
      fileUrl = result.secure_url;
    }

    // Upload thumbnail to Cloudinary
    let thumbnailUrl = '';
    if (req.files && req.files['thumbnail'] && req.files['thumbnail'][0]) {
      const result = await uploadToCloudinary(req.files['thumbnail'][0].buffer, {
        folder: 'netflix/images',
        resource_type: 'image',
      });
      thumbnailUrl = result.secure_url;
    }

    if (!fileUrl) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const media = new Media({
      title,
      description,
      type,
      url: fileUrl,
      thumbnail: thumbnailUrl || fileUrl, // fallback to video URL if no thumbnail
      category,
      uploadedBy: req.user.id
    });

    await media.save();
    res.json(media);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 });
    res.json(media);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
