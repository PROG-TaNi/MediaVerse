import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Calendar, Star, Users, Heart, Check, Play, Film } from 'lucide-react';
import { Content } from '../../types';
import StarRating from './StarRating';
import { truncateText, formatDate } from '../../utils/formatters';
import { useAuthStore } from '../../store/authStore';
import { toggleLike, toggleWatchlist, checkLikeStatus, checkWatchlistStatus } from '@/services/api';

interface ContentCardProps {
  content: Content;
  isFavorite?: boolean;
  onToggleFavorite?: (contentId: string) => void;
  className?: string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=400&fit=crop&crop=center&auto=format&dpr=2&q=80';

// Helper function to get appropriate fallback image based on content type
const getFallbackImage = (contentType: string) => {
  switch (contentType) {
    case 'movie':
      return '/movie.png';
    case 'book':
      return '/Books.png';
    case 'music':
      return '/music.png';
    default:
      return FALLBACK_IMAGE;
  }
};

const ContentCard: React.FC<ContentCardProps> = ({
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
      // Could show login modal here
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
      // Could show login modal here
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

  const handleWatchTrailer = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Search for the movie trailer on YouTube
    const searchQuery = `${content.title} official trailer`;
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    window.open(youtubeUrl, '_blank');
  };

  const handleCardClick = () => {
    window.location.href = `/content/${content.id}?type=${content.type}`;
  };

  const handleActorClick = (e: React.MouseEvent, actor: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Navigate to search results for this actor
    const searchUrl = `/search?query=${encodeURIComponent(actor)}&type=${content.type}`;
    window.location.href = searchUrl;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = getFallbackImage(content.type);
  };

  // Safely handle potentially undefined data
  const authors = content.authors || [];
  const genres = content.genres || [];
  const title = content.title || 'Untitled';
  const description = content.description || '';
  const averageRating = content.averageRating || 0;
  const ratingCount = content.ratingCount || 0;
  const coverImageUrl = content.coverImageUrl || getFallbackImage(content.type);

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
            {/* Watch Trailer button for movies */}
            {content.type === 'movie' && (
              <button
                onClick={handleWatchTrailer}
                className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-lg transition-all duration-200 transform hover:scale-110"
                title="Watch Trailer"
              >
                <Play size={18} />
              </button>
            )}
            
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
          <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-lg backdrop-blur-sm ${
            content.type === 'movie' ? 'bg-red-500/90 text-white' :
            content.type === 'book' ? 'bg-blue-500/90 text-white' :
            'bg-green-500/90 text-white'
          }`}>
            {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
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
        
        {/* Authors/Creators - Clickable for movies */}
        {authors.length > 0 && (
          <div className="mb-2">
            <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">
              {content.type === 'movie' ? 'Cast: ' : 'by '}
              {authors.slice(0, 2).map((author, index) => (
                <React.Fragment key={author}>
                  {content.type === 'movie' ? (
                    <button
                      onClick={(e) => handleActorClick(e, author)}
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 hover:underline transition-colors"
                      title={`Search for ${author}`}
                    >
                      {author}
                    </button>
                  ) : (
                    <span>{author}</span>
                  )}
                  {index < Math.min(authors.length, 2) - 1 && ', '}
                </React.Fragment>
              ))}
              {authors.length > 2 && '...'}
            </p>
          </div>
        )}
        
        {/* Description */}
        {description && (
          <p className="text-gray-600 dark:text-gray-400 text-xs mb-3 line-clamp-2">
            {truncateText(description, 80)}
          </p>
        )}
        
        {/* Genres */}
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {genres.slice(0, 2).map((genre, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full font-medium"
              >
                {genre}
              </span>
            ))}
            {genres.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                +{genres.length - 2}
              </span>
            )}
          </div>
        )}
        
        {/* Rating count */}
        {ratingCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Users size={12} />
            <span>{ratingCount} ratings</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentCard;