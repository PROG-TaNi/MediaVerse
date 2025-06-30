import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import ContentCard from '../components/ui/ContentCard';
import Button from '../components/ui/Button';
import GenreFilter from '../components/ui/GenreFilter';
import { searchMovies, Content } from '@/services/api';

// Define the genres
const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 
  'Family', 'Fantasy', 'Horror', 'Music', 'Mystery', 
  'Romance', 'Science Fiction', 'TV Movie'
];

const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Content[]>([]);
  const [allMovies, setAllMovies] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [allGenres, setAllGenres] = useState<string[]>([]);
  
  const observer = useRef<IntersectionObserver>();
  const lastMovieElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const loadMovies = useCallback(async (page: number, query: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await searchMovies(query, page, 20);
      
      if (page === 1) {
        setMovies(response);
        setAllMovies(response);
        
        // Extract all unique genres from the loaded movies
        const genres = new Set<string>();
        response.forEach(movie => {
          if (movie.genres) {
            movie.genres.forEach(genre => genres.add(genre));
          }
        });
        setAllGenres(Array.from(genres).sort());
      } else {
        setMovies(prev => [...prev, ...response]);
        setAllMovies(prev => [...prev, ...response]);
        
        // Update genres with new movies
        const genres = new Set<string>(allGenres);
        response.forEach(movie => {
          if (movie.genres) {
            movie.genres.forEach(genre => genres.add(genre));
          }
        });
        setAllGenres(Array.from(genres).sort());
      }
      
      // Check if we have more movies to load
      setHasMore(response.length === 20);
      
    } catch (err) {
      setError('Failed to load movies');
      console.error('Error loading movies:', err);
    } finally {
      setLoading(false);
    }
  }, [allGenres]);

  // Load initial movies
  useEffect(() => {
    loadMovies(1, searchQuery);
  }, []);

  // Load more movies when page changes
  useEffect(() => {
    if (currentPage > 1) {
      loadMovies(currentPage, searchQuery);
    }
  }, [currentPage, loadMovies, searchQuery]);

  // Filter movies based on selected genres
  const filteredMovies = useCallback(() => {
    if (selectedGenres.length === 0) {
      return movies;
    }
    
    return movies.filter(movie => 
      movie.genres && movie.genres.some(genre => selectedGenres.includes(genre))
    );
  }, [movies, selectedGenres]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setCurrentPage(1);
    setMovies([]);
    setAllMovies([]);
    setHasMore(true);
    setSelectedGenres([]);
    
    // Navigate to search results page
    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    setMovies([]);
    setAllMovies([]);
    setHasMore(true);
    setSelectedGenres([]);
    loadMovies(1, '');
  };

  const handleGenreChange = (genres: string[]) => {
    setSelectedGenres(genres);
  };

  const renderMovieCard = (movie: Content, index: number) => {
    const filteredList = filteredMovies();
    if (filteredList.length === index + 1) {
      return (
        <div key={movie.id} ref={lastMovieElementRef}>
          <ContentCard content={movie} />
        </div>
      );
    } else {
      return (
        <div key={movie.id}>
          <ContentCard content={movie} />
        </div>
      );
    }
  };

  const currentMovies = filteredMovies();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Movies
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Discover and explore thousands of movies
              </p>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <form onSubmit={handleSubmit} className="flex gap-2 flex-1 sm:flex-initial">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search movies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isSearching}
                  className="px-6"
                >
                  {isSearching ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    'Search'
                  )}
                </Button>
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    onClick={handleClearSearch}
                    className="px-4"
                  >
                    Clear
                  </Button>
                )}
              </form>
              
              {/* Genre Filter */}
              {allGenres.length > 0 && (
                <GenreFilter
                  allGenres={allGenres}
                  selectedGenres={selectedGenres}
                  onGenreChange={handleGenreChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Results Summary */}
        {(searchQuery || selectedGenres.length > 0) && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Showing {currentMovies.length} movie{currentMovies.length !== 1 ? 's' : ''}
              {searchQuery && ` for "${searchQuery}"`}
              {selectedGenres.length > 0 && ` in ${selectedGenres.join(', ')}`}
            </p>
          </div>
        )}

        {currentMovies.length === 0 && !loading && !isSearching && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <Search size={64} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery || selectedGenres.length > 0 ? 'No movies found' : 'No movies available'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery 
                ? `No movies found for "${searchQuery}". Try a different search term.`
                : selectedGenres.length > 0
                ? `No movies found in the selected genres. Try different genres.`
                : 'Check back later for new movies.'
              }
            </p>
          </div>
        )}

        {/* Movies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {currentMovies.map(renderMovieCard)}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="animate-spin" size={24} />
              <span className="text-gray-600 dark:text-gray-400">Loading more movies...</span>
            </div>
          </div>
        )}

        {/* End of Results */}
        {!hasMore && currentMovies.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery 
                ? `End of results for "${searchQuery}"`
                : selectedGenres.length > 0
                ? `End of results for selected genres`
                : 'You\'ve reached the end of all movies'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;