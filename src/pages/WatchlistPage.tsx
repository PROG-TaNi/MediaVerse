import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import ContentCard from '../components/ui/ContentCard';
import Button from '../components/ui/Button';
import GenreFilter from '../components/ui/GenreFilter';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, Eye } from 'lucide-react';
import { Content } from '../types';
import { getUserWatchlist, removeFromWatchlist } from '@/services/api';

const WatchlistPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [watchlist, setWatchlist] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [allGenres, setAllGenres] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadWatchlist();
    }
  }, [isAuthenticated, user?.id]);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const watchlistData = await getUserWatchlist(user!.id);
      setWatchlist(watchlistData);
      
      // Extract all unique genres from the watchlist
      const genres = new Set<string>();
      watchlistData.forEach(content => {
        if (content.genres) {
          content.genres.forEach(genre => genres.add(genre));
        }
      });
      setAllGenres(Array.from(genres).sort());
    } catch (err) {
      setError('Failed to load watchlist');
      console.error('Error loading watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async (contentId: string) => {
    if (!user?.id) return;

    try {
      await removeFromWatchlist(user.id, contentId);
      setWatchlist(prev => prev.filter(item => item.id !== contentId));
      
      // Update genres after removal
      const updatedWatchlist = watchlist.filter(item => item.id !== contentId);
      const genres = new Set<string>();
      updatedWatchlist.forEach(content => {
        if (content.genres) {
          content.genres.forEach(genre => genres.add(genre));
        }
      });
      setAllGenres(Array.from(genres).sort());
    } catch (err) {
      console.error('Error removing from watchlist:', err);
    }
  };

  const handleGenreChange = (genres: string[]) => {
    setSelectedGenres(genres);
  };

  // Filter watchlist based on selected genres
  const filteredWatchlist = selectedGenres.length === 0 
    ? watchlist 
    : watchlist.filter(content => 
        content.genres && content.genres.some(genre => selectedGenres.includes(genre))
      );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sign in to view your watchlist
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            You need to be logged in to access your watchlist.
          </p>
          <Link to="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Bookmark className="text-indigo-600 dark:text-indigo-400" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  My Watchlist
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {watchlist.length} item{watchlist.length !== 1 ? 's' : ''} in your watchlist
                </p>
              </div>
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

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Results Summary */}
        {selectedGenres.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Showing {filteredWatchlist.length} item{filteredWatchlist.length !== 1 ? 's' : ''} in {selectedGenres.join(', ')}
            </p>
          </div>
        )}

        {!loading && !error && filteredWatchlist.length === 0 && (
          <div className="text-center py-12">
            <Bookmark className="text-gray-400 dark:text-gray-600 mx-auto mb-4" size={64} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {selectedGenres.length > 0 ? 'No items found in selected genres' : 'Your watchlist is empty'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {selectedGenres.length > 0 
                ? 'Try selecting different genres or add more items to your watchlist.'
                : 'Start adding movies, books, and music to your watchlist to see them here.'
              }
            </p>
            <Link to="/movies">
              <Button>Browse Movies</Button>
            </Link>
          </div>
        )}

        {!loading && !error && filteredWatchlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredWatchlist.map((content) => (
              <div key={content.id} className="relative group">
                <ContentCard content={content} />
                
                {/* Action buttons overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex gap-2">
                    <Link to={`/content/${content.id}?type=${content.type}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Eye size={16} />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                      onClick={() => handleRemoveFromWatchlist(content.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage; 