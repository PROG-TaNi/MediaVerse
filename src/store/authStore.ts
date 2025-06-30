import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateProfilePicture: (profilePictureUrl: string) => void;
  updateProfile: (name: string, email: string) => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        profilePicture: undefined,
        favorites: {
          movies: [],
          books: [],
          music: [],
          podcasts: [],
          articles: []
        },
        createdAt: new Date().toISOString()
      },
      token: 'mock-token-for-testing',
      isAuthenticated: true,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Login failed');
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
        }
      },
      
      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Signup failed');
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Signup failed',
            isLoading: false,
          });
        }
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      clearError: () => {
        set({ error: null });
      },

      updateProfilePicture: (profilePictureUrl: string) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              profilePicture: profilePictureUrl
            }
          });
        }
      },

      updateProfile: async (name: string, email: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('http://localhost:5000/api/users/profile', {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${get().token}`
            },
            body: JSON.stringify({ name, email }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Profile update failed');
          set({
            user: data.user,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Profile update failed',
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);