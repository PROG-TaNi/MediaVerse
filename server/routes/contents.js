const express = require('express');
const Content = require('../models/Content');

const router = express.Router();

// GET /api/contents - get all contents, optionally filter by type
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    let query = {};
    if (type) query.type = type;
    const contents = await Content.find(query).sort({ createdAt: -1 });
    res.json({ contents });
  } catch (error) {
    console.error('Get contents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/contents/:id - get content by id
router.get('/:id', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) return res.status(404).json({ message: 'Content not found' });
    res.json({ content });
  } catch (error) {
    console.error('Get content by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/contents/search?q=... - search contents by title, description, authors, genres
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ contents: [] });
    const regex = new RegExp(q, 'i');
    const contents = await Content.find({
      $or: [
        { title: regex },
        { description: regex },
        { authors: regex },
        { genres: regex }
      ]
    });
    res.json({ contents });
  } catch (error) {
    console.error('Search contents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 