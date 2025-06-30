const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const favoritesSchema = new mongoose.Schema({
  movies: [{
    tmdbId: String,
    title: String,
    addedAt: Date,
    // ...other movie-specific fields
  }],
  books: [{
    bookId: String,
    title: String,
    addedAt: Date,
    // ...other book-specific fields
  }],
  music: [{
    trackId: String,
    title: String,
    addedAt: Date,
    // ...other music-specific fields
  }],
  podcasts: [{
    podcastId: String,
    title: String,
    addedAt: Date,
    // ...other podcast-specific fields
  }],
  articles: [{
    articleId: String,
    title: String,
    addedAt: Date,
    // ...other article-specific fields
  }]
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  favoriteGenres: [String],
  preferredLanguages: [String],
  favorites: { type: favoritesSchema, default: () => ({}) },
  watchlist: [Object],
  ratings: [Object],
  viewHistory: [Object],
  searchHistory: [String],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: { type: Date },
  photo: {
    type: String,
    default: ''
  }
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Password comparison method for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
