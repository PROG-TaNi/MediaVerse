import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  Heart, 
  Bookmark, 
  MessageCircle, 
  Calendar, 
  Users,
  Play,
  Plus,
  Check,
  ExternalLink
} from 'lucide-react';
import { 
  getMovieById, 
  getBookById, 
  getMusicById, 
  getReviews, 
  addReview, 
  toggleLike, 
  toggleWatchlist, 
  checkLikeStatus, 
  checkWatchlistStatus, 
  getLikesCount,
  getUserReview,
  getMovieCast,
  getTrailerSearchUrl
} from '@/services/api';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import StarRating from '../components/ui/StarRating';
import CastModal from '../components/ui/CastModal';
import { Content, Review } from '../types';
import { formatDate } from '../utils/formatters';

const ContentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'movie';
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [content, setContent] = useState<Content | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(10);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [showCastModal, setShowCastModal] = useState(false);

  useEffect(() => {
    if (!id || !type) return;
    
    const fetchContent = async () => {
      try {
        setLoading(true);
        let contentData: Content | null = null;
        
        switch (type) {
          case 'movie':
            contentData = await getMovieById(id);
            break;
          case 'book':
            contentData = await getBookById(id);
            break;
          case 'music':
            contentData = await getMusicById(id);
            break;
          default:
            throw new Error('Invalid content type');
        }
        
        if (contentData) {
          setContent(contentData);
          
          // Fetch reviews, likes count, and user interaction status
          const [reviewsData, likesCountData] = await Promise.all([
            getReviews(id),
            getLikesCount(id)
          ]);
          
          setReviews(reviewsData);
          setLikesCount(likesCountData);
          
          // Check user interaction status if authenticated
          if (isAuthenticated && user?.id) {
            const [likedStatus, watchlistStatus, userReviewData] = await Promise.all([
              checkLikeStatus(user.id, id),
              checkWatchlistStatus(user.id, id),
              getUserReview(id, user.id)
            ]);
            setIsLiked(likedStatus);
            setIsInWatchlist(watchlistStatus);
            setUserReview(userReviewData);
          }
        } else {
          setError('Content not found');
        }
      } catch (err) {
        setError('Failed to load content');
        console.error('Error fetching content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id, type, isAuthenticated, user?.id]);

  const handleLike = async () => {
    if (!isAuthenticated || !user?.id || !id) {
      // Redirect to login or show login modal
      return;
    }
    
    try {
      const result = await toggleLike(user.id, id, type);
      setIsLiked(result.isLiked);
      // Update likes count based on the action
      if (result.isLiked) {
        setLikesCount(prev => prev + 1);
      } else {
        setLikesCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleWatchlist = async () => {
    if (!isAuthenticated || !user?.id || !id) {
      // Redirect to login or show login modal
      return;
    }
    
    try {
      const result = await toggleWatchlist(user.id, id, type);
      setIsInWatchlist(result.isInWatchlist);
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };

  const handleWatchTrailer = async () => {
    if (!content?.title) return;
    
    try {
      const trailerUrl = await getTrailerSearchUrl(content.title);
      window.open(trailerUrl, '_blank');
    } catch (error) {
      console.error('Error opening trailer:', error);
      // Fallback to direct YouTube search
      const fallbackUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(content.title + ' official trailer')}`;
      window.open(fallbackUrl, '_blank');
    }
  };

  const handleShowCast = () => {
    setShowCastModal(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !id || !reviewText.trim()) return;

    try {
      setSubmittingReview(true);
      const newReview = await addReview(id, type, {
        rating: reviewRating,
        reviewText: reviewText.trim(),
        userId: user?.id || '',
        userName: user?.name || 'Anonymous',
        contentId: id,
        createdAt: new Date().toISOString()
      });
      
      // Update reviews list and user review
      setReviews(prev => [newReview, ...prev.filter(r => r.userId !== user?.id)]);
      setUserReview(newReview);
      setReviewText('');
      setReviewRating(10);
      setShowReviewForm(false);
    } catch (err) {
      console.error('Error submitting review:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit review. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    if (type === 'movie' && id) {
      const fetchCast = async () => {
        try {
          const castData = await getMovieCast(id);
          setCast(castData);
        } catch (err) {
          console.error('Error fetching movie cast:', err);
        }
      };

      fetchCast();
    }
  }, [type, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Content not found'}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image and Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <img
                  src={content.coverImageUrl}
                  alt={content.title}
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x600?text=No+Image';
                  }}
                />
                
                {/* Action Buttons */}
                <div className="p-6">
                  <div className="flex gap-3 mb-4">
                    <Button 
                      onClick={handleLike}
                      variant={isLiked ? "primary" : "outline"}
                      className={`flex-1 ${isLiked ? 'bg-red-600 hover:bg-red-700 border-red-600' : 'border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                    >
                      <Heart size={18} className={`mr-2 ${isLiked ? 'fill-current' : ''}`} />
                      {isLiked ? 'Liked' : 'Like'} ({likesCount})
                    </Button>
                    
                    <Button 
                      onClick={handleWatchlist}
                      variant={isInWatchlist ? "primary" : "outline"}
                      className={`flex-1 ${isInWatchlist ? 'bg-green-600 hover:bg-green-700 border-green-600' : 'border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                    >
                      {isInWatchlist ? (
                        <Check size={18} className="mr-2" />
                      ) : (
                        <Bookmark size={18} className="mr-2" />
                      )}
                      {isInWatchlist ? 'Watched' : 'Watchlist'}
                    </Button>
                  </div>
                  
                  {/* Music/Book special buttons */}
                  {type === 'music' && content && content.authors && content.authors.length > 0 && (
                    <div className="space-y-3 mb-4">
                      <Button
                        onClick={() => {
                          const searchQuery = `${content.title} ${content.authors[0]}`;
                          const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
                          window.open(youtubeUrl, '_blank');
                        }}
                        className="w-full"
                        variant="outline"
                      >
                        Listen Music
                      </Button>
                      <Button
                        onClick={() => {
                          const artistName = encodeURIComponent(content.authors[0]);
                          window.location.href = `/artist/${artistName}`;
                        }}
                        className="w-full"
                        variant="outline"
                      >
                        View Artist
                      </Button>
                    </div>
                  )}
                  {type === 'book' && content && content.authors && content.authors.length > 0 && (
                    <div className="space-y-3 mb-4">
                      <Button
                        onClick={() => {
                          const searchQuery = `${content.title} ${content.authors[0]}`;
                          const googleBooksUrl = `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(searchQuery)}`;
                          window.open(googleBooksUrl, '_blank');
                        }}
                        className="w-full"
                        variant="outline"
                      >
                        Read Book
                      </Button>
                      <Button
                        onClick={() => {
                          const authorName = encodeURIComponent(content.authors[0]);
                          window.location.href = `/search?q=${authorName}`;
                        }}
                        className="w-full"
                        variant="outline"
                      >
                        View Author
                      </Button>
                    </div>
                  )}

                  {/* Movie special buttons */}
                  {type === 'movie' && (
                    <div className="space-y-3 mb-4">
                      <Button 
                        onClick={handleWatchTrailer}
                        className="w-full"
                      >
                        <Play size={18} className="mr-2" />
                        Watch Trailer
                        <ExternalLink size={16} className="ml-2" />
                      </Button>
                      <Button 
                        onClick={handleShowCast}
                        variant="outline"
                        className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      >
                        <Users size={18} className="mr-2" />
                        View Cast
                      </Button>
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <Button 
                      onClick={() => setShowReviewForm(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <MessageCircle size={18} className="mr-2" />
                      Write Review
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content Details */}
          <div className="lg:col-span-2">
            {/* Title and Basic Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {content.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    by {content.authors.join(', ')}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center mb-2">
                    <StarRating rating={content.averageRating} size={24} />
                    <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                      {content.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {content.ratingCount.toLocaleString()} ratings
                  </p>
                </div>
              </div>

              {/* Meta Information */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar size={16} className="mr-2" />
                  <span className="text-sm">{formatDate(content.releaseDate)}</span>
                </div>
                
                {content.views && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Users size={16} className="mr-2" />
                    <span className="text-sm">{content.views.toLocaleString()} views</span>
                  </div>
                )}
                
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MessageCircle size={16} className="mr-2" />
                  <span className="text-sm">{reviews.length} reviews</span>
                </div>

                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Heart size={16} className="mr-2" />
                  <span className="text-sm">{likesCount} likes</span>
                </div>
              </div>

              {/* Genres */}
              {content.genres.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Genres
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {content.genres.map((genre, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Summary
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {content.description}
                </p>
              </div>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Write a Review
                </h3>
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rating (out of 10)
                    </label>
                    <StarRating 
                      rating={reviewRating} 
                      size={24} 
                      interactive 
                      onRatingChange={setReviewRating}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Review
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Share your thoughts about this content..."
                      required
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      disabled={submittingReview}
                      className="flex-1"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowReviewForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Reviews ({reviews.length})
              </h3>
              
              {reviews.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  No reviews yet. Be the first to review this content!
                </p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {review.userName}
                          </h4>
                          <div className="flex items-center mt-1">
                            <StarRating rating={review.rating} size={16} />
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {review.reviewText}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cast Modal */}
      {showCastModal && (
        <CastModal
          isOpen={showCastModal}
          onClose={() => setShowCastModal(false)}
          cast={cast}
          movieTitle={content?.title || ''}
        />
      )}
    </div>
  );
};

export default ContentDetailPage;