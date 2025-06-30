const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  type: String, // movie, book, music, etc.
  title: String,
  description: String,
  genres: [String],
  authors: [String],
  releaseDate: Date,
  externalId: String, // ID from TMDB, Goodreads, etc.
  rating: Number,
  views: Number,
  ratingCount: Number,
  metadata: Object // for extra info like image, trailer URL, etc.
});

module.exports = mongoose.model('Content', contentSchema);
