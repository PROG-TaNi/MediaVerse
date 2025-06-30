import { useState, useEffect, useCallback } from 'react';
import { searchMovies, searchBooks, searchMusic, searchArticles } from '../services/api.js';

const useSearch = (initialQuery = '') => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState({
    movies: [],
    books: [],
    music: [],
    articles: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({ movies: [], books: [], music: [], articles: [] });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [moviesData, booksData, musicData, articlesData] = await Promise.all([
        searchMovies(searchQuery),
        searchBooks(searchQuery),
        searchMusic(searchQuery),
        searchArticles(searchQuery)
      ]);

      setResults({
        movies: moviesData.slice(0, 5),
        books: booksData.slice(0, 5),
        music: musicData.slice(0, 5),
        articles: articlesData.slice(0, 5)
      });
    } catch (err) {
      setError('Failed to fetch search results');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        search(query);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, search]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error
  };
};

export default useSearch;