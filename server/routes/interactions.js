const express = require('express');
const Like = require('../models/Like');
const Watchlist = require('../models/Watchlist');
const Review = require('../models/Review');
const router = express.Router();

// Toggle like for content
router.post('/likes/:userId/:contentId', async (req, res) => {
  try {
    const { userId, contentId } = req.params;
    const { contentType } = req.body;
    
    if (!contentType) {
      return res.status(400).json({
        success: false,
        message: 'Content type is required'
      });
    }

    // Check if user already liked this content
    const existingLike = await Like.findOne({ userId, contentId });
    
    if (existingLike) {
      // Unlike - remove from database
      await Like.findByIdAndDelete(existingLike._id);
      
      return res.json({
        success: true,
        isLiked: false,
        message: 'Content unliked successfully'
      });
    } else {
      // Like - add to database
      const newLike = new Like({
        userId,
        contentId,
        contentType
      });
      
      await newLike.save();
      
      return res.json({
        success: true,
        isLiked: true,
        message: 'Content liked successfully'
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already liked this content'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    });
  }
});

// Check if user liked content
router.get('/likes/:userId/:contentId', async (req, res) => {
  try {
    const { userId, contentId } = req.params;
    
    const like = await Like.findOne({ userId, contentId });
    
    res.json({
      success: true,
      isLiked: !!like
    });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check like status'
    });
  }
});

// Get user's liked content
router.get('/likes/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const likes = await Like.find({ userId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      likedContent: likes.map(like => like.contentId)
    });
  } catch (error) {
    console.error('Error fetching user likes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user likes'
    });
  }
});

// Toggle watchlist for content
router.post('/watchlist/:userId/:contentId', async (req, res) => {
  try {
    const { userId, contentId } = req.params;
    const { contentType } = req.body;
    
    if (!contentType) {
      return res.status(400).json({
        success: false,
        message: 'Content type is required'
      });
    }

    // Check if content is already in watchlist
    const existingWatchlist = await Watchlist.findOne({ userId, contentId });
    
    if (existingWatchlist) {
      // Remove from watchlist
      await Watchlist.findByIdAndDelete(existingWatchlist._id);
      
      return res.json({
        success: true,
        isInWatchlist: false,
        message: 'Content removed from watchlist'
      });
    } else {
      // Add to watchlist
      const newWatchlist = new Watchlist({
        userId,
        contentId,
        contentType
      });
      
      await newWatchlist.save();
      
      return res.json({
        success: true,
        isInWatchlist: true,
        message: 'Content added to watchlist'
      });
    }
  } catch (error) {
    console.error('Error toggling watchlist:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Content is already in your watchlist'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to toggle watchlist'
    });
  }
});

// Check if content is in user's watchlist
router.get('/watchlist/:userId/:contentId', async (req, res) => {
  try {
    const { userId, contentId } = req.params;
    
    const watchlist = await Watchlist.findOne({ userId, contentId });
    
    res.json({
      success: true,
      isInWatchlist: !!watchlist
    });
  } catch (error) {
    console.error('Error checking watchlist status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check watchlist status'
    });
  }
});

// Get user's watchlist
router.get('/watchlist/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const watchlist = await Watchlist.find({ userId }).sort({ addedAt: -1 });
    
    res.json({
      success: true,
      watchlistContent: watchlist.map(item => item.contentId)
    });
  } catch (error) {
    console.error('Error fetching user watchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user watchlist'
    });
  }
});

// Get content statistics (likes count, reviews count, average rating)
router.get('/stats/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    
    // Get likes count
    const likesCount = await Like.countDocuments({ contentId });
    
    // Get reviews count and average rating
    const reviewStats = await Review.aggregate([
      { $match: { contentId } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);
    
    const stats = {
      likesCount,
      totalReviews: reviewStats.length > 0 ? reviewStats[0].totalReviews : 0,
      averageRating: reviewStats.length > 0 ? Math.round(reviewStats[0].averageRating * 10) / 10 : 0
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching content stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content statistics'
    });
  }
});

// Get user's activity summary
router.get('/activity/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [likesCount, watchlistCount, reviewsCount] = await Promise.all([
      Like.countDocuments({ userId }),
      Watchlist.countDocuments({ userId }),
      Review.countDocuments({ userId })
    ]);
    
    res.json({
      success: true,
      activity: {
        likesCount,
        watchlistCount,
        reviewsCount
      }
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity'
    });
  }
});

module.exports = router; 