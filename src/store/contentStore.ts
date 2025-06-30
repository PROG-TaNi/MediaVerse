import { create } from 'zustand';
import { Content, ContentType } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

function getEndpointForType(type?: ContentType) {
  if (!type) return `${API_BASE_URL}/contents`;
  switch (type) {
    case 'movie':
      return `${API_BASE_URL}/movies/popular`;
    case 'book':
      return `${API_BASE_URL}/books/popular`;
    case 'music':
      return `${API_BASE_URL}/music/popular`;
    default:
      return `${API_BASE_URL}/contents?type=${type}`;
  }
}

type ContentState = {
  contents: Content[];
  featuredContents: Content[];
  trendingContents: Content[];
  recommendedContents: Content[];
  selectedContent: Content | null;
  isLoading: boolean;
  error: string | null;
  fetchContents: (type?: ContentType, limit?: number) => Promise<Content[]>;
  fetchContentById: (id: string) => Promise<void>;
  fetchRecommendedContents: (userId: string) => Promise<void>;
  searchContents: (query: string) => Promise<Content[]>;
  clearSelectedContent: () => void;
};

export const useContentStore = create<ContentState>((set, get) => ({
  contents: [],
  featuredContents: [],
  trendingContents: [],
  recommendedContents: [],
  selectedContent: null,
  isLoading: false,
  error: null,

  fetchContents: async (type, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      let url = getEndpointForType(type);
      const response = await fetch(url);
      const data = await response.json();
      
      // Handle different response formats
      let items = [];
      if (data.contents) {
        items = data.contents;
      } else if (data.movies) {
        items = data.movies;
      } else if (data.books) {
        items = data.books;
      } else if (data.music) {
        items = data.music;
      } else if (Array.isArray(data)) {
        items = data;
      }
      
      // Apply limit if specified
      if (limit) {
        items = items.slice(0, limit);
      }
      
      set({
        contents: items,
        featuredContents: items.filter((c: Content) => c.averageRating > 4.5).slice(0, 5),
        trendingContents: [...items].sort(() => Math.random() - 0.5).slice(0, 5),
        isLoading: false,
      });
      
      return items; // Return the items for the HomePage to use
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch contents',
        isLoading: false,
      });
      return []; // Return empty array on error
    }
  },

  fetchContentById: async (id) => {
    set({ isLoading: true, error: null, selectedContent: null });
    try {
      const response = await fetch(`${API_BASE_URL}/contents/${id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Content not found');
      set({ selectedContent: data.content, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch content',
        isLoading: false,
      });
    }
  },

  fetchRecommendedContents: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      // For now, just fetch all contents and shuffle for recommendations
      const response = await fetch(`${API_BASE_URL}/contents`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch recommendations');
      const recommendedContents = [...data.contents].sort(() => Math.random() - 0.5).slice(0, 8);
      set({ recommendedContents, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch recommendations',
        isLoading: false,
      });
    }
  },

  searchContents: async (query) => {
    try {
      // Try all endpoints for search
      const [movies, books, music] = await Promise.all([
        fetch(`${API_BASE_URL}/movies?query=${encodeURIComponent(query)}`).then(r => r.json()).then(d => d.movies || []),
        fetch(`${API_BASE_URL}/books?query=${encodeURIComponent(query)}`).then(r => r.json()).then(d => d.books || []),
        fetch(`${API_BASE_URL}/music?query=${encodeURIComponent(query)}`).then(r => r.json()).then(d => d.music || []),
      ]);
      return [...movies, ...books, ...music];
    } catch (error) {
      return [];
    }
  },

  clearSelectedContent: () => {
    set({ selectedContent: null });
  },
}));