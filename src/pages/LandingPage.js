import React, { useState, useEffect } from 'react';
import { getPopularMovies } from '../services/tmdb';
import HeroSection from '../components/HeroSection';
import TrendingSection from '../components/TrendingSection';

const LandingPage = () => {
  const [featuredMovie, setFeaturedMovie] = useState(null);

  useEffect(() => {
    const fetchFeaturedMovie = async () => {
      const movies = await getPopularMovies();
      if (movies.length > 0) {
        setFeaturedMovie(movies[0]);
      }
    };

    fetchFeaturedMovie();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <HeroSection movie={featuredMovie} />
      <TrendingSection />
    </div>
  );
};

export default LandingPage;