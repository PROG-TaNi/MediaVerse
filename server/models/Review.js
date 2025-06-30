const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Using string ID for simplicity
  userName: { type: String, required: true },
  contentId: { type: String, required: true }, // Content ID from the dataset
  contentType: { type: String, enum: ['movie', 'book', 'music'], required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, required: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate reviews from same user for same content
reviewSchema.index({ userId: 1, contentId: 1 }, { unique: true });

// Update the updatedAt field before saving
reviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Review', reviewSchema); 