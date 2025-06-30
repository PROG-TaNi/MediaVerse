const express = require('express');
const User = require('../models/User');
const UserInteraction = require('../models/UserInteraction');
const auth = require('../middleware/auth');

const router = express.Router();

// Add to favorites
router.post('/add', auth, async (req, res) => {
  try {
    const { contentType, contentId, title, additionalData } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already in favorites
    const existingFavorite = user.favorites[`${contentType}s`].find(
      item => item.tmdbId === contentId || item.bookId === contentId || 
             item.trackId === contentId || item.podcastId === contentId || 
             item.articleId === contentId
    );

    if (existingFavorite) {
      return res.status(400).json({ message: 'Already in favorites' });
    }

    // Add to favorites based on content type
    const favoriteItem = {
      title,
      addedAt: new Date(),
      ...additionalData
    };

    switch (contentType) {
      case 'movie':
        favoriteItem.tmdbId = contentId;
        user.favorites.movies.push(favoriteItem);
        break;
      case 'book':
        favoriteItem.bookId = contentId;
        user.favorites.books.push(favoriteItem);
        break;
      case 'music':
        favoriteItem.trackId = contentId;
        user.favorites.music.push(favoriteItem);
        break;
      case 'podcast':
        favoriteItem.podcastId = contentId;
        user.favorites.podcasts.push(favoriteItem);
        break;
      case 'article':
        favoriteItem.articleId = contentId;
        user.favorites.articles.push(favoriteItem);
        break;
    }

    await user.save();

    // Log interaction
    const interaction = new UserInteraction({
      userId: req.userId,
      contentType,
      contentId,
      interactionType: 'favorite'
    });
    await interaction.save();

    res.json({ message: 'Added to favorites', favorites: user.favorites });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from favorites
router.delete('/remove', auth, async (req, res) => {
  try {
    const { contentType, contentId } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from favorites based on content type
    switch (contentType) {
      case 'movie':
        user.favorites.movies = user.favorites.movies.filter(
          item => item.tmdbId !== contentId
        );
        break;
      case 'book':
        user.favorites.books = user.favorites.books.filter(
          item => item.bookId !== contentId
        );
        break;
      case 'music':
        user.favorites.music = user.favorites.music.filter(
          item => item.trackId !== contentId
        );
        break;
      case 'podcast':
        user.favorites.podcasts = user.favorites.podcasts.filter(
          item => item.podcastId !== contentId
        );
        break;
      case 'article':
        user.favorites.articles = user.favorites.articles.filter(
          item => item.articleId !== contentId
        );
        break;
    }

    await user.save();
    res.json({ message: 'Removed from favorites', favorites: user.favorites });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user favorites
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('favorites');
    res.json({ favorites: user.favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;