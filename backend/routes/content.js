const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const Series = require('../models/Series');
const Season = require('../models/Season');
const Episode = require('../models/Episode');
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

// ---- SERIES ----
router.get('/series', async (req, res) => {
  try {
    const series = await Series.find().sort({ createdAt: -1 });
    res.json(series);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.post('/series', auth, upload.fields([{ name: 'bannerImage' }, { name: 'thumbnail' }]), async (req, res) => {
  try {
    const { title, description, categories } = req.body;
    let bannerImage = '', thumbnail = '';

    if (req.files['bannerImage']) {
      const result = await uploadToCloudinary(req.files['bannerImage'][0].buffer, {
        folder: 'netflix/images',
        resource_type: 'image',
      });
      bannerImage = result.secure_url;
    }
    if (req.files['thumbnail']) {
      const result = await uploadToCloudinary(req.files['thumbnail'][0].buffer, {
        folder: 'netflix/images',
        resource_type: 'image',
      });
      thumbnail = result.secure_url;
    }

    const categoryArray = categories ? categories.split(',').map(c => c.trim()) : [];

    const series = new Series({ title, description, categories: categoryArray, bannerImage, thumbnail });
    await series.save();
    res.json(series);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/series/:id', async (req, res) => {
  try {
    const series = await Series.findById(req.params.id);
    if (!series) return res.status(404).json({ message: 'Series not found' });
    
    // Get all seasons for this series
    const seasons = await Season.find({ seriesId: series._id }).sort({ seasonNumber: 1 });
    
    // For each season, get its episodes
    const seasonsWithEpisodes = await Promise.all(seasons.map(async (season) => {
      const episodes = await Episode.find({ seasonId: season._id }).sort({ episodeNumber: 1 });
      return { ...season.toObject(), episodes };
    }));

    res.json({ ...series.toObject(), seasons: seasonsWithEpisodes });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// ---- SEASONS ----
router.post('/seasons', auth, async (req, res) => {
  try {
    const { seriesId, seasonNumber } = req.body;
    const season = new Season({ seriesId, seasonNumber });
    await season.save();
    res.json(season);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// ---- EPISODES ----
router.post('/episodes', auth, upload.fields([{ name: 'video' }, { name: 'thumbnail' }]), async (req, res) => {
  try {
    const { seasonId, episodeNumber, title, description, duration } = req.body;
    let videoUrl = '', thumbnail = '';
    
    if (req.files['video']) {
      const result = await uploadToCloudinary(req.files['video'][0].buffer, {
        folder: 'netflix/videos',
        resource_type: 'video',
      });
      videoUrl = result.secure_url;
    }
    if (req.files['thumbnail']) {
      const result = await uploadToCloudinary(req.files['thumbnail'][0].buffer, {
        folder: 'netflix/images',
        resource_type: 'image',
      });
      thumbnail = result.secure_url;
    }

    const episode = new Episode({ seasonId, episodeNumber, title, description, duration, videoUrl, thumbnail });
    await episode.save();
    res.json(episode);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/episodes/:id', async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.id).populate('seasonId');
    res.json(episode);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
