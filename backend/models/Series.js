const mongoose = require('mongoose');

const seriesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  bannerImage: { type: String },
  thumbnail: { type: String },
  categories: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Series', seriesSchema);
