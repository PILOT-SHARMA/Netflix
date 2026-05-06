const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Media = require('../models/Media');

// Ensure upload directories exist
const videosDir = path.join(__dirname, '..', 'uploads', 'videos');
const thumbnailsDir = path.join(__dirname, '..', 'uploads', 'thumbnails');
if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });
if (!fs.existsSync(thumbnailsDir)) fs.mkdirSync(thumbnailsDir, { recursive: true });

// Configure multer for local disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'file') {
      cb(null, videosDir);
    } else if (file.fieldname === 'thumbnail') {
      cb(null, thumbnailsDir);
    } else {
      cb(null, videosDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Accept both video file and thumbnail image
const uploadFields = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

router.post('/upload', auth, uploadFields, async (req, res) => {
  try {
    const { title, description, type, category } = req.body;
    
    // Build the video/image URL from the saved file
    let fileUrl = '';
    const baseUrl = 'https://netflix-xovf.onrender.com';
    
    if (req.files && req.files['file'] && req.files['file'][0]) {
      const videoFile = req.files['file'][0];
      fileUrl = `${baseUrl}/uploads/videos/${videoFile.filename}`;
    }

    // Build the thumbnail URL
    let thumbnailUrl = '';
    if (req.files && req.files['thumbnail'] && req.files['thumbnail'][0]) {
      const thumbFile = req.files['thumbnail'][0];
      thumbnailUrl = `${baseUrl}/uploads/thumbnails/${thumbFile.filename}`;
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
