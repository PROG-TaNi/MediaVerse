const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // For parsing JSON from frontend
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Try to connect to MongoDB (optional)
let mongoConnected = false;
try {
  const connectDB = require('./config/database');
  connectDB().then(() => {
    mongoConnected = true;
    console.log("✅ MongoDB connection established");
  }).catch((error) => {
    console.log("⚠️  MongoDB connection failed, running without database");
    console.log("   Some features like reviews, likes, and watchlists may not work");
  });
} catch (error) {
  console.log("⚠️  MongoDB not configured, running without database");
}

// Import routes
const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');
const reviewsRoutes = require('./routes/reviews');
const interactionsRoutes = require('./routes/interactions');
const contentsRoutes = require('./routes/contents');
const moviesRoutes = require('./routes/movies');
const booksRoutes = require('./routes/books');
const musicRoutes = require('./routes/music');
const usersRoutes = require('./routes/users');
const trailersRoutes = require('./routes/trailers');
const geminiRouter = require('./routes/gemini');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/interactions', interactionsRoutes);
app.use('/api/contents', contentsRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/trailers', trailersRoutes);
app.use('/api/gemini', geminiRouter);

// Serve static files from the project root
app.use(express.static(path.join(__dirname, '..')));

// Test route
app.get('/', (req, res) => {
  res.json({
    message: "🎬 MediaVerse API is live!",
    mongoConnected,
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    mongoConnected,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Using local datasets: movies and books`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
