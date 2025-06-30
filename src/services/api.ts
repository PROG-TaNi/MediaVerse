const API_BASE_URL = 'http://localhost:5000/api';

export interface Content {
  id: string;
  type: 'movie' | 'book' | 'music';
  title: string;
  description: string;
  authors: string[];
  genres: string[];
  releaseDate: string;
  coverImageUrl: string;
  averageRating: number;
  ratingCount: number;
  views?: number;
  metadata?: any;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  contentId: string;
  rating: number;
  reviewText: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  movies?: T[];
  books?: T[];
  music?: T[];
  total?: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

// Generic search function
async function searchContent<T>(endpoint: string, query: string = '', page: number = 1, limit: number = 20): Promise<T[]> {
  try {
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      limit: limit.toString()
    });
    
    const response = await fetch(`${API_BASE_URL}/${endpoint}?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle the new response format with pagination info
    if (data.movies) {
      return data.movies as T[];
    } else if (data.books) {
      return data.books as T[];
    } else if (data.music) {
      return data.music as T[];
    } else if (Array.isArray(data)) {
      return data as T[];
    } else {
      return [];
    }
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [];
  }
}

// Movie functions
export const searchMovies = (query: string = '', page: number = 1, limit: number = 20): Promise<Content[]> => {
  return searchContent<Content>('movies', query, page, limit);
};

export const getPopularMovies = async (): Promise<Content[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/movies/popular`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.movies || [];
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};

export const getMovieById = async (id: string): Promise<Content | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/movies/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.movie || null;
  } catch (error) {
    console.error('Error fetching movie:', error);
    return null;
  }
};

// Book functions
export const searchBooks = (query: string = '', page: number = 1, limit: number = 20): Promise<Content[]> => {
  return searchContent<Content>('books', query, page, limit);
};

export const getPopularBooks = async (): Promise<Content[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/books/popular`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.books || [];
  } catch (error) {
    console.error('Error fetching popular books:', error);
    return [];
  }
};

export const getBookById = async (id: string): Promise<Content | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/books/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.book || null;
  } catch (error) {
    console.error('Error fetching book:', error);
    return null;
  }
};

// Music functions
export const searchMusic = (query: string = '', page: number = 1, limit: number = 20): Promise<Content[]> => {
  return searchContent<Content>('music', query, page, limit);
};

export const getPopularMusic = async (): Promise<Content[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/music/popular`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.music || [];
  } catch (error) {
    console.error('Error fetching popular music:', error);
    return [];
  }
};

export const getMusicById = async (id: string): Promise<Content | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/music/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.music || null;
  } catch (error) {
    console.error('Error fetching music:', error);
    return null;
  }
};

// Get songs by artist
export const getSongsByArtist = async (artistName: string, limit: number = 50): Promise<Content[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/music/artist/${encodeURIComponent(artistName)}?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.music || [];
  } catch (error) {
    console.error('Error fetching artist songs:', error);
    // Fallback: search for music with artist name
    return searchMusic(artistName, 1, limit);
  }
};

// Review functions
export const getReviews = async (contentId: string): Promise<Review[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${contentId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.reviews || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

export const addReview = async (contentId: string, contentType: string, review: Omit<Review, 'id'>): Promise<Review> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        ...review, 
        contentId,
        contentType 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.review;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

// Auth functions
export const login = async (email: string, password: string): Promise<{ token: string; user: any }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const register = async (name: string, email: string, password: string): Promise<{ token: string; user: any }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};

// User API functions
export const uploadProfilePicture = async (file: File, token?: string): Promise<{ profilePictureUrl: string }> => {
  const formData = new FormData();
  formData.append('profilePicture', file);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/users/profile-picture`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload profile picture');
  }

  return response.json();
};

export const updateUserProfile = async (userData: { name: string; email: string }, token: string): Promise<{ user: any }> => {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update profile');
  }

  return response.json();
};

export const getUserProfile = async (token: string): Promise<{ user: any }> => {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch profile');
  }

  return response.json();
};

// Like and Watchlist functions
export const toggleLike = async (userId: string, contentId: string, contentType: string): Promise<{ isLiked: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/interactions/likes/${userId}/${contentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contentType }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { isLiked: data.isLiked || false };
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

export const checkLikeStatus = async (userId: string, contentId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/interactions/likes/${userId}/${contentId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.isLiked || false;
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
};

export const toggleWatchlist = async (userId: string, contentId: string, contentType: string): Promise<{ isInWatchlist: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/interactions/watchlist/${userId}/${contentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contentType }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { isInWatchlist: data.isInWatchlist || false };
  } catch (error) {
    console.error('Error toggling watchlist:', error);
    throw error;
  }
};

export const checkWatchlistStatus = async (userId: string, contentId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/interactions/watchlist/${userId}/${contentId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.isInWatchlist || false;
  } catch (error) {
    console.error('Error checking watchlist status:', error);
    return false;
  }
};

export const getUserWatchlist = async (userId: string): Promise<Content[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/interactions/watchlist/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const contentIds = data.watchlistContent || [];
    
    // Fetch the actual content for each ID
    const contentPromises = contentIds.map(async (contentId: string) => {
      try {
        // Try to get content from different endpoints
        const [movieRes, bookRes, musicRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/movies/${contentId}`),
          fetch(`${API_BASE_URL}/books/${contentId}`),
          fetch(`${API_BASE_URL}/music/${contentId}`)
        ]);
        
        if (movieRes.status === 'fulfilled' && movieRes.value.ok) {
          const movieData = await movieRes.value.json();
          return { ...movieData.movie, type: 'movie' };
        }
        if (bookRes.status === 'fulfilled' && bookRes.value.ok) {
          const bookData = await bookRes.value.json();
          return { ...bookData.book, type: 'book' };
        }
        if (musicRes.status === 'fulfilled' && musicRes.value.ok) {
          const musicData = await musicRes.value.json();
          return { ...musicData.music, type: 'music' };
        }
        
        return null;
      } catch (error) {
        console.error(`Error fetching content ${contentId}:`, error);
        return null;
      }
    });
    
    const contents = await Promise.all(contentPromises);
    return contents.filter(content => content !== null) as Content[];
  } catch (error) {
    console.error('Error fetching user watchlist:', error);
    throw error;
  }
};

export const removeFromWatchlist = async (userId: string, contentId: string, contentType: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/interactions/watchlist/${userId}/${contentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contentType }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
};

export const getLikesCount = async (contentId: string): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE_URL}/interactions/stats/${contentId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.stats?.likesCount || 0;
  } catch (error) {
    console.error('Error fetching likes count:', error);
    return 0;
  }
};

export const getUserLikedContent = async (userId: string): Promise<Content[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/interactions/likes/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const contentIds = data.likedContent || [];
    
    // Fetch the actual content for each ID
    const contentPromises = contentIds.map(async (contentId: string) => {
      try {
        // Try to get content from different endpoints
        const [movieRes, bookRes, musicRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/movies/${contentId}`),
          fetch(`${API_BASE_URL}/books/${contentId}`),
          fetch(`${API_BASE_URL}/music/${contentId}`)
        ]);
        
        if (movieRes.status === 'fulfilled' && movieRes.value.ok) {
          const movieData = await movieRes.value.json();
          return { ...movieData.movie, type: 'movie' };
        }
        if (bookRes.status === 'fulfilled' && bookRes.value.ok) {
          const bookData = await bookRes.value.json();
          return { ...bookData.book, type: 'book' };
        }
        if (musicRes.status === 'fulfilled' && musicRes.value.ok) {
          const musicData = await musicRes.value.json();
          return { ...musicData.music, type: 'music' };
        }
        
        return null;
      } catch (error) {
        console.error(`Error fetching content ${contentId}:`, error);
        return null;
      }
    });
    
    const contents = await Promise.all(contentPromises);
    return contents.filter(content => content !== null) as Content[];
  } catch (error) {
    console.error('Error fetching user liked content:', error);
    throw error;
  }
};

// Get review statistics for content
export const getReviewStats = async (contentId: string): Promise<{
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${contentId}/stats`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.stats || {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
};

// Get user's review for specific content
export const getUserReview = async (contentId: string, userId: string): Promise<Review | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${contentId}/user/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.review;
  } catch (error) {
    console.error('Error fetching user review:', error);
    return null;
  }
};

// Get movie cast information
export const getMovieCast = async (movieId: string): Promise<{
  name: string;
  character: string;
  order: number;
}[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/movies/${movieId}/cast`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.cast || [];
  } catch (error) {
    console.error('Error fetching movie cast:', error);
    return [];
  }
};

// Get YouTube trailer search URL
export const getTrailerSearchUrl = async (movieTitle: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/trailers/search/${encodeURIComponent(movieTitle)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.searchUrl || '';
  } catch (error) {
    console.error('Error getting trailer search URL:', error);
    // Fallback to direct YouTube search
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(movieTitle + ' official trailer')}`;
  }
};

// Forgot password
export const forgotPassword = async (email: string): Promise<{ message: string; resetToken?: string; resetUrl?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (token: string, newPassword: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
}; 