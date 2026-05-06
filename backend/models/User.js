const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profiles: [{
    name: { type: String, required: true },
    avatar: { type: String, required: true },
    watchHistory: [{
      episodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Episode' },
      progress: { type: Number, default: 0 },
      lastWatched: { type: Date, default: Date.now }
    }],
    continueWatching: [{
      episodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Episode' },
    }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
