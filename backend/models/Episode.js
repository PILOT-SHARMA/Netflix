const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  seasonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
  episodeNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String, required: true },
  thumbnail: { type: String },
  duration: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Episode', episodeSchema);
