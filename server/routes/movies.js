const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');

const router = express.Router();

// OMDb API configuration
const OMDB_API_KEY = '5446de6b';
const OMDB_BASE_URL = 'http://www.omdbapi.com';

// Try to import Content model (optional)
let Content;
try {
  Content = require('../models/Content');
} catch (error) {
  console.log("⚠️  Content model not available, running without database");
}

// Cache for movies data
let moviesCache = [];
let moviesLoaded = false;

// Cache for credits data
let creditsData = [];
let creditsLoaded = false;

// Function to get movie poster from OMDb API
async function getMoviePoster(title, year = null) {
  try {
    const searchQuery = year ? `${title} ${year}` : title;
    const response = await axios.get(OMDB_BASE_URL, {
      params: {
        apikey: OMDB_API_KEY,
        t: searchQuery,
        type: 'movie'
      }
    });
    
    if (response.data.Response === 'True' && response.data.Poster && response.data.Poster !== 'N/A') {
      return response.data.Poster;
    }
    
    // Fallback: try with just the title
    if (year) {
      const fallbackResponse = await axios.get(OMDB_BASE_URL, {
        params: {
          apikey: OMDB_API_KEY,
          t: title,
          type: 'movie'
        }
      });
      
      if (fallbackResponse.data.Response === 'True' && fallbackResponse.data.Poster && fallbackResponse.data.Poster !== 'N/A') {
        return fallbackResponse.data.Poster;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching movie poster:', error.message);
    return null;
  }
}

// Load movies from CSV file
async function loadMoviesFromCSV() {
  if (moviesLoaded) return moviesCache;
  
  return new Promise((resolve, reject) => {
    const movies = [];
    const csvPath = path.join(__dirname, '../../moviedataset/tmdb_5000_movies.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ Movies CSV file not found:', csvPath);
      reject(new Error('Movies CSV file not found'));
      return;
    }
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Parse JSON fields
          const genres = row.genres ? JSON.parse(row.genres).map(g => g.name) : [];
          const keywords = row.keywords ? JSON.parse(row.keywords).map(k => k.name) : [];
          const productionCompanies = row.production_companies ? JSON.parse(row.production_companies).map(c => c.name) : [];
          
          movies.push({
            id: parseInt(row.id),
            title: row.title,
            original_title: row.original_title,
            overview: row.overview,
            tagline: row.tagline,
            genres: genres,
            keywords: keywords,
            production_companies: productionCompanies,
            release_date: row.release_date,
            runtime: row.runtime ? parseInt(row.runtime) : null,
            vote_average: parseFloat(row.vote_average) || 0,
            vote_count: parseInt(row.vote_count) || 0,
            popularity: parseFloat(row.popularity) || 0,
            budget: parseInt(row.budget) || 0,
            revenue: parseInt(row.revenue) || 0,
            original_language: row.original_language,
            status: row.status,
            homepage: row.homepage
          });
        } catch (error) {
          console.error('Error parsing movie row:', error);
        }
      })
      .on('end', () => {
        moviesCache = movies;
        moviesLoaded = true;
        console.log(`✅ Loaded ${movies.length} movies from CSV`);
        resolve(movies);
      })
      .on('error', reject);
  });
}

// Load credits from CSV file
async function loadCreditsFromCSV() {
  if (creditsLoaded) return creditsData;
  
  return new Promise((resolve, reject) => {
    const credits = [];
    const csvPath = path.join(__dirname, '../../moviedataset/tmdb_5000_credits.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ Credits CSV file not found:', csvPath);
      reject(new Error('Credits CSV file not found'));
      return;
    }
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          credits.push({
            movie_id: parseInt(row.movie_id),
            title: row.title,
            cast: row.cast,
            crew: row.crew
          });
        } catch (error) {
          console.error('Error parsing credits row:', error);
        }
      })
      .on('end', () => {
        creditsData = credits;
        creditsLoaded = true;
        console.log(`✅ Loaded ${credits.length} credits from CSV`);
        resolve(credits);
      })
      .on('error', reject);
  });
}

// Helper: Map movie data to Content schema
function mapMovieToContent(movie, posterUrl = null) {
  // Use fallback movie image if no poster available
  // const fallbackPoster = path.join(__dirname, '..', '..', 'movie.png');
  const finalPosterUrl = posterUrl || '/movie.png';
  
  return {
    type: 'movie',
    title: movie.title,
    description: movie.overview || movie.tagline || '',
    genres: movie.genres || [],
    authors: movie.production_companies || [],
    releaseDate: movie.release_date,
    externalId: movie.id.toString(),
    rating: movie.vote_average,
    ratingCount: movie.vote_count,
    views: Math.floor(movie.popularity * 100), // Use popularity as views
    metadata: {
      poster: finalPosterUrl,
      backdrop: '',
      language: movie.original_language,
      runtime: movie.runtime,
      budget: movie.budget,
      revenue: movie.revenue,
      status: movie.status,
      homepage: movie.homepage,
      keywords: movie.keywords || [],
      original_title: movie.original_title,
      tagline: movie.tagline
    },
    createdAt: new Date(),
  };
}

function mapContentForFrontend(content) {
  return {
    id: content.externalId,
    type: content.type,
    title: content.title,
    description: content.description,
    authors: content.authors || [],
    genres: content.genres || [],
    releaseDate: content.releaseDate,
    coverImageUrl: content.metadata?.poster || '',
    averageRating: content.rating || 0,
    ratingCount: content.ratingCount || 0,
    views: content.views || 0,
    metadata: content.metadata || {},
    createdAt: content.createdAt,
    // Additional fields for compatibility
    vote_average: content.rating || 0,
    vote_count: content.ratingCount || 0,
    release_date: content.releaseDate,
    poster_path: content.metadata?.poster || '',
    overview: content.description,
    production_companies: content.authors || [],
    runtime: content.metadata?.runtime,
    budget: content.metadata?.budget,
    revenue: content.metadata?.revenue,
    original_title: content.metadata?.original_title,
    tagline: content.metadata?.tagline
  };
}

// GET /api/movies?query=... - search movies with pagination
router.get('/', async (req, res) => {
  const { query, limit = 20, page = 1 } = req.query;
  
  try {
    const movies = await loadMoviesFromCSV();
    const credits = await loadCreditsFromCSV();
    
    let filteredMovies = movies;
    
    // Apply search filter if query provided
    if (query) {
      const searchTerm = query.toLowerCase().trim();
      
      filteredMovies = movies.filter(movie => {
        // Search in title
        const titleMatch = movie.title.toLowerCase().includes(searchTerm);
        
        // Search in overview
        const overviewMatch = movie.overview && movie.overview.toLowerCase().includes(searchTerm);
        
        // Search in genres
        const genreMatch = movie.genres && movie.genres.some(genre => 
          genre.toLowerCase().includes(searchTerm)
        );
        
        // Search in cast (from credits)
        const movieCredits = credits.find(credit => credit.movie_id === movie.id);
        let castMatch = false;
        
        if (movieCredits && movieCredits.cast) {
          try {
            const cast = JSON.parse(movieCredits.cast);
            castMatch = cast.some(castMember => 
              castMember.name && castMember.name.toLowerCase().includes(searchTerm)
            );
          } catch (parseError) {
            // Skip if cast JSON is invalid
            console.error('Error parsing cast JSON for movie', movie.id, parseError);
          }
        }
        
        return titleMatch || overviewMatch || genreMatch || castMatch;
      });
    }
    
    // Convert to Content format and fetch posters for first page only
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedMovies = filteredMovies.slice(startIndex, endIndex);
    
    const contentMovies = await Promise.all(
      paginatedMovies.map(async (movie) => {
        let posterUrl = null;
        if (pageNum === 1) { // Only fetch posters for first page to avoid rate limiting
          posterUrl = await getMoviePoster(movie.title, movie.release_date?.split('-')[0]);
        }
        return mapMovieToContent(movie, posterUrl);
      })
    );
    
    res.json({ 
      movies: contentMovies.map(mapContentForFrontend),
      total: filteredMovies.length,
      page: pageNum,
      limit: limitNum,
      hasMore: endIndex < filteredMovies.length
    });
    
  } catch (error) {
    console.error('Error searching movies:', error);
    res.status(500).json({ error: 'Failed to search movies' });
  }
});

// GET /api/movies/popular - get popular movies
router.get('/popular', async (req, res) => {
  try {
    const movies = await loadMoviesFromCSV();
    
    // Sort by popularity (vote_average * vote_count)
    const popularMovies = movies
      .sort((a, b) => (b.vote_average * b.vote_count) - (a.vote_average * a.vote_count))
      .slice(0, 20);
    
    // Convert to Content format and fetch posters
    const contentMovies = await Promise.all(
      popularMovies.map(async (movie) => {
        const posterUrl = await getMoviePoster(movie.title, movie.release_date?.split('-')[0]);
        return mapMovieToContent(movie, posterUrl);
      })
    );
    
    res.json({ 
      movies: contentMovies.map(mapContentForFrontend)
    });
    
  } catch (error) {
    console.error('Popular movies fetch error:', error.message);
    res.status(500).json({ message: 'Failed to fetch popular movies' });
  }
});

// Get movie cast information - this route must come before /:id
router.get('/:id/cast', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Load credits data if not already loaded
    await loadCreditsFromCSV();
    
    // Find the movie in the credits dataset
    const movieCredits = creditsData.find(movie => movie.movie_id === parseInt(id));
    
    if (!movieCredits) {
      return res.status(404).json({
        success: false,
        message: 'Cast information not found for this movie'
      });
    }
    
    // Parse the cast JSON string
    let cast = [];
    try {
      cast = JSON.parse(movieCredits.cast);
    } catch (parseError) {
      console.error('Error parsing cast JSON:', parseError);
      cast = [];
    }
    
    // Get top 20 cast members (ordered by importance)
    const topCast = cast
      .sort((a, b) => a.order - b.order)
      .slice(0, 20)
      .map(member => ({
        name: member.name,
        character: member.character,
        order: member.order
      }));
    
    res.json({
      success: true,
      cast: topCast
    });
  } catch (error) {
    console.error('Error fetching movie cast:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cast information'
    });
  }
});

// GET /api/movies/:id - get movie by ID (this must come after /:id/cast)
router.get('/:id', async (req, res) => {
  try {
    const movies = await loadMoviesFromCSV();
    const movie = movies.find(m => m.id.toString() === req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    // Fetch poster for this specific movie
    const posterUrl = await getMoviePoster(movie.title, movie.release_date?.split('-')[0]);
    const contentMovie = mapMovieToContent(movie, posterUrl);
    
    res.json({ movie: mapContentForFrontend(contentMovie) });
    
  } catch (error) {
    console.error('Movie fetch error:', error.message);
    res.status(500).json({ message: 'Failed to fetch movie' });
  }
});

module.exports = router; 