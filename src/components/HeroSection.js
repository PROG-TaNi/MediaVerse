import React from 'react';
import { Play } from 'lucide-react';

const HeroSection = ({ movie }) => {
  const backdropUrl = `https://image.tmdb.org/t/p/original${movie?.backdrop_path}`;

  return (
    <div className="relative h-screen">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              {movie?.title}
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              {movie?.overview}
            </p>
            <div className="flex items-center gap-4">
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full flex items-center font-semibold transition-colors">
                <Play className="w-5 h-5 mr-2" />
                Watch Now
              </button>
              <button className="bg-gray-800/80 hover:bg-gray-700/80 text-white px-8 py-3 rounded-full font-semibold transition-colors">
                More Info
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;