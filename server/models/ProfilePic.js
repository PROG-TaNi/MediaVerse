const mongoose = require('mongoose');

const profilePicSchema = new mongoose.Schema({
  data: {
    type: String, // base64 string
    required: true,
  },
  contentType: {
    type: String, // e.g., 'image/png'
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('ProfilePic', profilePicSchema);