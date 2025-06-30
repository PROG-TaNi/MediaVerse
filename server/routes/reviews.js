const express = require('express');
const Review = require('../models/Review');
const router = express.Router();

// Add a review (without authentication middleware)
router.post('/', async (req, res) => {
  try {
    const { contentId, contentType, rating, reviewText, userId, userName } = req.body;
    
    if (!contentId || !contentType || !rating || !reviewText || !userId || !userName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: contentId, contentType, rating, reviewText, userId, userName'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if user already reviewed this content
    const existingReview = await Review.findOne({ userId, contentId });
    
    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.reviewText = reviewText;
      existingReview.updatedAt = new Date();
      await existingReview.save();
      
      return res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        review: existingReview
      });
    }

    // Create new review
    const newReview = new Review({
      userId,
      userName,
      contentId,
      contentType,
      rating: Number(rating),
      reviewText
    });
    
    await newReview.save();
    
    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review: newReview
    });
  } catch (error) {
    console.error('Error adding/updating review:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this content'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to add review'
    });
  }
});

// Get all reviews for a content item
router.get('/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    
    const reviews = await Review.find({ contentId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to prevent overwhelming response
    
    res.json({
      success: true,
      reviews: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// Get user's review for a specific content
router.get('/:contentId/user/:userId', async (req, res) => {
  try {
    const { contentId, userId } = req.params;
    
    const review = await Review.findOne({ contentId, userId });
    
    res.json({
      success: true,
      review: review || null
    });
  } catch (error) {
    console.error('Error fetching user review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user review'
    });
  }
});

// Update a review
router.put('/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, reviewText } = req.body;
    
    if (!rating || !reviewText) {
      return res.status(400).json({
        success: false,
        message: 'Rating and review text are required'
      });
    }

    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    review.rating = Number(rating);
    review.reviewText = reviewText;
    review.updatedAt = new Date();
    await review.save();
    
    res.json({
      success: true,
      message: 'Review updated successfully',
      review: review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
});

// Delete a review
router.delete('/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findByIdAndDelete(reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
});

// Get review statistics for a content item
router.get('/:contentId/stats', async (req, res) => {
  try {
    const { contentId } = req.params;
    
    const stats = await Review.aggregate([
      { $match: { contentId } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);
    
    if (stats.length === 0) {
      return res.json({
        success: true,
        stats: {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        }
      });
    }
    
    const stat = stats[0];
    const ratingDistribution = stat.ratingDistribution.reduce((acc, rating) => {
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      success: true,
      stats: {
        totalReviews: stat.totalReviews,
        averageRating: Math.round(stat.averageRating * 10) / 10,
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review statistics'
    });
  }
});

module.exports = router; 