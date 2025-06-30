const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
  type: String, // view, like, rating, search, share, etc.
  details: Object, // can store things like duration, query string, etc.
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserInteraction', interactionSchema);
