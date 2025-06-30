// Utility functions for local movie data
// Since we're using local datasets instead of TMDB API

export const getImageUrl = (path, size = 'original') => {
  if (!path) return null;
  
  // If it's already a full URL, return as is
  if (path.startsWith('http')) {
    return path;
  }
  
  // For local data, we might need to handle different image sources
  // For now, return a placeholder or the path as is
  return path || 'https://via.placeholder.com/300x400?text=Movie+Cover';
};

// Helper function to get movie poster URL from our local data
export const getMoviePosterUrl = (movie) => {
  if (movie.metadata?.poster) {
    return movie.metadata.poster;
  }
  
  // Use fallback movie image
  return '/movie.png';
};

// Helper function to get movie backdrop URL from our local data
export const getMovieBackdropUrl = (movie) => {
  if (movie.metadata?.backdrop) {
    return movie.metadata.backdrop;
  }
  
  // Generate a placeholder based on movie title
  const title = encodeURIComponent(movie.title || 'Movie');
  return `https://via.placeholder.com/1200x600?text=${title}`;
};

// Legacy functions for backward compatibility
export const getTrendingMovies = async () => {
  console.warn('getTrendingMovies: Use local API instead');
  return [];
};

export const getPopularMovies = async () => {
  console.warn('getPopularMovies: Use local API instead');
  return [];
};

export const searchMovies = async (query) => {
  console.warn('searchMovies: Use local API instead');
  return [];
};

export const getMovieDetails = async (movieId) => {
  console.warn('getMovieDetails: Use local API instead');
  return null;
};