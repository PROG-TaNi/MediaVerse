const express = require('express');
const router = express.Router();

// YouTube trailer search endpoint
router.get('/search/:movieTitle', async (req, res) => {
  try {
    const { movieTitle } = req.params;
    
    // Construct YouTube search URL for official trailer
    const searchQuery = encodeURIComponent(`${movieTitle} official trailer`);
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
    
    // For now, we'll return a direct YouTube search URL
    // In a production environment, you'd use the YouTube Data API
    res.json({
      success: true,
      searchUrl: youtubeSearchUrl,
      message: 'YouTube search URL generated successfully'
    });
  } catch (error) {
    console.error('Error generating YouTube search URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate YouTube search URL'
    });
  }
});

// Alternative: Direct YouTube trailer search using YouTube Data API (requires API key)
router.get('/api-search/:movieTitle', async (req, res) => {
  try {
    const { movieTitle } = req.params;
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'YouTube API key not configured'
      });
    }
    
    const searchQuery = encodeURIComponent(`${movieTitle} official trailer`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&videoDuration=medium&maxResults=1&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const videoId = data.items[0].id.videoId;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      res.json({
        success: true,
        videoUrl: videoUrl,
        videoId: videoId,
        title: data.items[0].snippet.title,
        description: data.items[0].snippet.description
      });
    } else {
      res.json({
        success: false,
        message: 'No trailer found'
      });
    }
  } catch (error) {
    console.error('Error searching YouTube API:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search YouTube'
    });
  }
});

module.exports = router; 