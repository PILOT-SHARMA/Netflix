const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Series = require('../models/Series');
const Season = require('../models/Season');
const Episode = require('../models/Episode');

const uploadDir = path.join(__dirname, '..', 'uploads');
const videosDir = path.join(uploadDir, 'videos');
const imagesDir = path.join(uploadDir, 'images');
if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, videosDir);
    else cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

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
    const baseUrl = 'https://netflix-xovf.onrender.com/uploads/images/';

    if (req.files['bannerImage']) bannerImage = baseUrl + req.files['bannerImage'][0].filename;
    if (req.files['thumbnail']) thumbnail = baseUrl + req.files['thumbnail'][0].filename;

    const categoryArray = categories ? categories.split(',').map(c => c.trim()) : [];

    const series = new Series({ title, description, categories: categoryArray, bannerImage, thumbnail });
    await series.save();
    res.json(series);
  } catch (err) {
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
    
    if (req.files['video']) videoUrl = 'https://netflix-xovf.onrender.com/uploads/videos/' + req.files['video'][0].filename;
    if (req.files['thumbnail']) thumbnail = 'https://netflix-xovf.onrender.com/uploads/images/' + req.files['thumbnail'][0].filename;

    const episode = new Episode({ seasonId, episodeNumber, title, description, duration, videoUrl, thumbnail });
    await episode.save();
    res.json(episode);
  } catch (err) {
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
