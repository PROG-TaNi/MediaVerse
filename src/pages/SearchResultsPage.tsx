import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Loader2, ArrowLeft, User, Film, BookOpen, Music } from 'lucide-react';
import ContentCard from '../components/ui/ContentCard';
import Button from '../components/ui/Button';
import GenreFilter from '../components/ui/GenreFilter';
import { searchMovies, searchBooks, searchMusic, Content } from '@/services/api';

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [allResults, setAllResults] = useState<{
    movies: Content[];
    books: Content[];
    music: Content[];
  }>({ movies: [], books: [], music: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'movies' | 'books' | 'music'>('all');
  
  // Check if the search query might be a person's name
  const isPersonSearch = query.split(' ').length >= 2 || query.toLowerCase().includes('actor') || query.toLowerCase().includes('author') || query.toLowerCase().includes('artist');

  const loadSearchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Search all content types
      const [movies, books, music] = await Promise.all([
        searchMovies(searchQuery, 1, 50).catch(() => []),
        searchBooks(searchQuery, 1, 50).catch(() => []),
        searchMusic(searchQuery, 1, 50).catch(() => [])
      ]);
      
      setAllResults({ movies, books, music });
      
      // Extract all unique genres from all results
      const genres = new Set<string>();
      [...movies, ...books, ...music].forEach(item => {
        if (item.genres) {
          item.genres.forEach(genre => genres.add(genre));
        }
      });
      setAllGenres(Array.from(genres).sort());
      
    } catch (err) {
      setError('Failed to load search results');
      console.error('Error loading search results:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load search results when query changes
  useEffect(() => {
    if (query) {
      loadSearchResults(query);
    }
  }, [query, loadSearchResults]);

  // Filter results based on selected genres
  const filterByGenres = useCallback((items: Content[]) => {
    if (selectedGenres.length === 0) return items;
    return items.filter(item => 
      item.genres && item.genres.some(genre => selectedGenres.includes(genre))
    );
  }, [selectedGenres]);

  // Get filtered results for current tab
  const getFilteredResults = useCallback(() => {
    const filteredMovies = filterByGenres(allResults.movies);
    const filteredBooks = filterByGenres(allResults.books);
    const filteredMusic = filterByGenres(allResults.music);
    
    switch (activeTab) {
      case 'movies':
        return filteredMovies;
      case 'books':
        return filteredBooks;
      case 'music':
        return filteredMusic;
      default:
        return [...filteredMovies, ...filteredBooks, ...filteredMusic];
    }
  }, [allResults, activeTab, filterByGenres]);

  const handleGenreChange = (genres: string[]) => {
    setSelectedGenres(genres);
  };

  const currentResults = getFilteredResults();
  const totalResults = allResults.movies.length + allResults.books.length + allResults.music.length;

  // Group results by person if it's a person search
  const getPersonResults = () => {
    if (!isPersonSearch) return null;
    
    const personName = query.toLowerCase();
    const personMovies = allResults.movies.filter(movie => 
      movie.authors?.some(author => author.toLowerCase().includes(personName))
    );
    const personBooks = allResults.books.filter(book => 
      book.authors?.some(author => author.toLowerCase().includes(personName))
    );
    const personMusic = allResults.music.filter(music => 
      music.authors?.some(artist => artist.toLowerCase().includes(personName))
    );
    
    return { movies: personMovies, books: personBooks, music: personMusic };
  };

  const personResults = getPersonResults();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600 dark:text-gray-400">Searching for "{query}"...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 bg-pattern">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              to="/"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
            >
              <ArrowLeft size={20} />
              Back to Home
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 gradient-text">
                Search Results
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Found {totalResults} results for "<span className="font-semibold text-purple-600 dark:text-purple-400">"{query}"</span>"
              </p>
            </div>
            
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

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 z-40 relative max-w-screen-sm mx-auto">
          <div className="inline-flex flex-wrap gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-2 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
              }`}
            >
              All ({totalResults})
            </button>
            <button
              onClick={() => setActiveTab('movies')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'movies'
                  ? 'bg-red-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
            >
              Movies ({allResults.movies.length})
            </button>
            <button
              onClick={() => setActiveTab('books')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'books'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
            >
              Books ({allResults.books.length})
            </button>
            <button
              onClick={() => setActiveTab('music')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'music'
                  ? 'bg-green-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
              }`}
            >
              Music ({allResults.music.length})
            </button>
          </div>
        </div>

        {/* Results Summary */}
        {(selectedGenres.length > 0) && (
          <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <p className="text-purple-800 dark:text-purple-200 text-sm">
              Showing {currentResults.length} result{currentResults.length !== 1 ? 's' : ''}
              {selectedGenres.length > 0 && ` filtered by ${selectedGenres.join(', ')}`}
            </p>
          </div>
        )}

        {/* Results Grid */}
        {currentResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {currentResults.map(item => (
              <ContentCard key={item.id} content={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 border border-gray-200 dark:border-gray-700">
              <Search size={64} className="mx-auto mb-6 text-gray-400 animate-float" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                No results found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                Try adjusting your search terms or filters
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setSelectedGenres([])}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Clear Filters
                </button>
                <Link
                  to="/"
                  className="px-6 py-3 border border-purple-600 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  Browse All Content
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage; 