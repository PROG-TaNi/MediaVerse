const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Using string ID for simplicity
  contentId: { type: String, required: true }, // Content ID from the dataset
  contentType: { type: String, enum: ['movie', 'book', 'music'], required: true },
  addedAt: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate watchlist entries from same user for same content
watchlistSchema.index({ userId: 1, contentId: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', watchlistSchema); 