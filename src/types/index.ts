export type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profilePicture?: string;
  favorites: {
    movies: string[];
    books: string[];
    music: string[];
    podcasts: string[];
    articles: string[];
  };
  createdAt: string;
};

export type ContentType = 'movie' | 'book' | 'article' | 'music' | 'podcast';

export type Content = {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  authors: string[];
  genres: string[];
  releaseDate: string;
  coverImageUrl: string;
  averageRating: number;
  ratingCount: number;
  metadata?: Record<string, any>;
  createdAt: string;
  views?: number;
};

export type Review = {
  id: string;
  userId: string;
  userName: string;
  contentId: string;
  rating: number;
  reviewText: string;
  createdAt: string;
};

export type UserInteraction = {
  userId: string;
  contentId: string;
  interactionType: 'view' | 'rate' | 'bookmark';
  value?: number;
  timestamp: string;
};