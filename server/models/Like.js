const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Using string ID for simplicity
  contentId: { type: String, required: true }, // Content ID from the dataset
  contentType: { type: String, enum: ['movie', 'book', 'music'], required: true },
  createdAt: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate likes from same user for same content
likeSchema.index({ userId: 1, contentId: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema); 