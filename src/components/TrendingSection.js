import React, { useState, useEffect } from 'react';
import { getTrendingMovies } from '../services/tmdb';
import MovieCard from './MovieCard';

const TrendingSection = () => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      const data = await getTrendingMovies();
      setMovies(data);
      setIsLoading(false);
    };

    fetchMovies();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-700 rounded mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-white mb-8">Trending Now</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {movies.slice(0, 6).map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
};

export default TrendingSection;