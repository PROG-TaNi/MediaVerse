const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const User = require('../models/User');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/profile-pictures');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + (req.userId || 'user') + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Try to import User model (optional)
let UserModel;
try {
  UserModel = require('../models/User');
} catch (error) {
  console.log("⚠️  User model not available, running without database");
}

// GET /api/users/profile - get user profile
router.get('/profile', async (req, res) => {
  try {
    if (!UserModel) {
      // Mock response when database is not available
      return res.json({
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          profilePicture: null,
          role: 'user',
          createdAt: new Date().toISOString()
        }
      });
    }

    // Get user from database
    const user = await UserModel.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

// PUT /api/users/profile - update user profile
router.put('/profile', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!UserModel) {
      // Mock response when database is not available
      return res.json({
        message: 'Profile updated successfully',
        user: {
          id: '1',
          name: name || 'John Doe',
          email: email || 'john@example.com',
          profilePicture: null,
          role: 'user',
          createdAt: new Date().toISOString()
        }
      });
    }

    // Update user in database
    const user = await UserModel.findByIdAndUpdate(
      req.userId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Failed to update user profile' });
  }
});

// POST /api/users/profile-picture - upload profile picture
router.post('/profile-picture', upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Generate the URL for the uploaded file
    const profilePictureUrl = `/uploads/profile-pictures/${req.file.filename}`;
    
    if (!UserModel) {
      // Mock response when database is not available
      return res.json({
        message: 'Profile picture uploaded successfully',
        profilePictureUrl: profilePictureUrl
      });
    }

    // If we have authentication, update user's profile picture in database
    if (req.userId) {
      const user = await UserModel.findByIdAndUpdate(
        req.userId,
        { profilePicture: profilePictureUrl },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({
        message: 'Profile picture uploaded successfully',
        profilePictureUrl: profilePictureUrl,
        user
      });
    }

    // If no authentication, just return the URL
    res.json({
      message: 'Profile picture uploaded successfully',
      profilePictureUrl: profilePictureUrl
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
});

// DELETE /api/users/profile-picture - remove profile picture
router.delete('/profile-picture', async (req, res) => {
  try {
    if (!UserModel) {
      // Mock response when database is not available
      return res.json({
        message: 'Profile picture removed successfully'
      });
    }

    // Get current user to find existing profile picture
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the file if it exists
    if (user.profilePicture) {
      const filePath = path.join(__dirname, '../..', user.profilePicture);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Update user to remove profile picture
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.userId,
      { profilePicture: null },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile picture removed successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error removing profile picture:', error);
    res.status(500).json({ message: 'Failed to remove profile picture' });
  }
});

// Upload profile picture endpoint
router.post('/upload-profile-picture', upload.single('photo'), async (req, res) => {
  try {
    const userId = req.user.id; // Make sure you have authentication middleware
    const photoUrl = `/uploads/profile-pictures/${req.file.filename}`;
    await UserModel.findByIdAndUpdate(userId, { photo: photoUrl });
    res.json({ success: true, photoUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

module.exports = router; 