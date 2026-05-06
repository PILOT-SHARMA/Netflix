const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  seriesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Series', required: true },
  seasonNumber: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Season', seasonSchema);
