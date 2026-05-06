const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all profiles
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.profiles);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Add a new profile
router.post('/', auth, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user.id);
    
    if (user.profiles.length >= 5) {
      return res.status(400).json({ message: 'Maximum of 5 profiles allowed' });
    }

    user.profiles.push({ name, avatar });
    await user.save();
    
    res.json(user.profiles);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Update profile
router.put('/:profileId', auth, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user.id);
    
    const profile = user.profiles.id(req.params.profileId);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    if (name) profile.name = name;
    if (avatar) profile.avatar = avatar;

    await user.save();
    res.json(user.profiles);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Delete profile
router.delete('/:profileId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.profiles.pull(req.params.profileId);
    await user.save();
    
    res.json(user.profiles);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
