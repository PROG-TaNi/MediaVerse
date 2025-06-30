import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Calendar, Star, Users, Heart, Check, Play, Music, Mic, User } from 'lucide-react';
import { Content } from '../../types';
import StarRating from './StarRating';
import { truncateText, formatDate } from '../../utils/formatters';
import { useAuthStore } from '../../store/authStore';
import { toggleLike, toggleWatchlist, checkLikeStatus, checkWatchlistStatus } from '@/services/api';

interface MusicCardProps {
  content: Content;
  isFavorite?: boolean;
  onToggleFavorite?: (contentId: string) => void;
  className?: string;
}

const FALLBACK_IMAGE = '/music.png';

const MusicCard: React.FC<MusicCardProps> = ({
  content,
  isFavorite = false,
  onToggleFavorite,
  className,
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const [isLiked, setIsLiked] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check initial like and watchlist status
  useEffect(() => {
    const checkStatus = async () => {
      if (!isAuthenticated || !user?.id) return;
      
      try {
        const [likedStatus, watchlistStatus] = await Promise.all([
          checkLikeStatus(user.id, content.id),
          checkWatchlistStatus(user.id, content.id)
        ]);
        
        setIsLiked(likedStatus);
        setIsInWatchlist(watchlistStatus);
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };

    checkStatus();
  }, [isAuthenticated, user?.id, content.id]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(content.id);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated || !user?.id) {
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      const result = await toggleLike(user.id, content.id, content.type);
      setIsLiked(result.isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated || !user?.id) {
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      const result = await toggleWatchlist(user.id, content.id, content.type);
      setIsInWatchlist(result.isInWatchlist);
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleListenToSong = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Search for the song on YouTube
    const searchQuery = `${content.title} ${content.authors.join(' ')}`;
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    window.open(youtubeUrl, '_blank');
  };

  const handleLyrics = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Redirect to Google search for lyrics
    const searchQuery = `${content.title} ${content.authors.join(' ')} lyrics`;
    const googleLyricsUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(googleLyricsUrl, '_blank');
  };

  const handleMusicianClick = (e: React.MouseEvent, musician: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Navigate to search results for this musician
    const searchUrl = `/search?query=${encodeURIComponent(musician)}&type=music`;
    window.location.href = searchUrl;
  };

  const handleArtistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Navigate to artist page with all songs by this artist
    if (content.authors.length > 0) {
      const artistName = encodeURIComponent(content.authors[0]); // Use the first artist
      const artistUrl = `/artist/${artistName}`;
      window.location.href = artistUrl;
    }
  };

  const handleCardClick = () => {
    window.location.href = `/content/${content.id}?type=${content.type}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = FALLBACK_IMAGE;
  };

  // Safely handle potentially undefined data
  const authors = content.authors || [];
  const genres = content.genres || [];
  const title = content.title || 'Untitled';
  const description = content.description || '';
  const averageRating = content.averageRating || 0;
  const ratingCount = content.ratingCount || 0;
  const coverImageUrl = content.coverImageUrl || FALLBACK_IMAGE;

  return (
    <div 
      className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer card-hover-effect border border-gray-200 dark:border-gray-700 ${className}`}
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={coverImageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={handleImageError}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2 flex-wrap justify-center">
            <button
              onClick={handleListenToSong}
              className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-lg transition-all duration-200 transform hover:scale-110"
              title="Listen to Song"
            >
              <Play size={18} />
            </button>
            
            <button
              onClick={handleLyrics}
              className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 shadow-lg transition-all duration-200 transform hover:scale-110"
              title="View Lyrics"
            >
              <Mic size={18} />
            </button>
            
            <button
              onClick={handleLike}
              className={`p-3 rounded-full transition-all duration-200 transform hover:scale-110 ${
                isLiked 
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg' 
                  : 'bg-white/90 text-gray-700 hover:bg-white shadow-lg'
              }`}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart size={18} className={isLiked ? 'fill-current' : ''} />
            </button>
            
            <button
              onClick={handleWatchlist}
              className={`p-3 rounded-full transition-all duration-200 transform hover:scale-110 ${
                isInWatchlist 
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg' 
                  : 'bg-white/90 text-gray-700 hover:bg-white shadow-lg'
              }`}
              title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {isInWatchlist ? <Check size={18} /> : <Bookmark size={18} />}
            </button>
          </div>
        </div>
        
        {/* Content type badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-xs font-bold rounded-full shadow-lg backdrop-blur-sm bg-green-500/90 text-white">
            <Music size={12} className="inline mr-1" />
            Music
          </span>
        </div>

        {/* Rating badge */}
        {averageRating > 0 && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/90 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm">
              <Star size={12} className="fill-current" />
              <span>{averageRating.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Content info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2 line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {title}
        </h3>
        
        {/* Musicians (clickable) */}
        {authors.length > 0 && (
          <div className="mb-2">
            <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">
              by{' '}
              {authors.slice(0, 2).map((author, index) => (
                <React.Fragment key={author}>
                  <button
                    onClick={(e) => handleMusicianClick(e, author)}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 hover:underline transition-colors"
                    title={`Search for ${author}`}
                  >
                    {author}
                  </button>
                  {index < Math.min(authors.length, 2) - 1 && ', '}
                </React.Fragment>
              ))}
              {authors.length > 2 && '...'}
            </p>
          </div>
        )}
        
        {/* Album info */}
        {content.metadata?.album && (
          <p className="text-gray-500 dark:text-gray-500 text-xs mb-2 line-clamp-1">
            Album: {content.metadata.album}
          </p>
        )}
        
        {/* Genres */}
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
        
        {/* Rating and release date */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Star size={12} className="fill-current text-yellow-500" />
            <span>{averageRating.toFixed(1)}</span>
            <span>({ratingCount})</span>
          </div>
          
          {content.releaseDate && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{formatDate(content.releaseDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicCard; 