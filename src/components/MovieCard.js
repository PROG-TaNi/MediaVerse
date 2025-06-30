import React from 'react';
import { getMoviePosterUrl } from '../services/tmdb';

const MovieCard = ({ movie }) => {
  const posterUrl = getMoviePosterUrl(movie);
  
  return (
    <div className="relative group cursor-pointer overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105">
      <img 
        src={posterUrl} 
        alt={movie.title}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {Console.log("");
          e.target.src = 'https://via.placeholder.com/300x400?text=Movie+Cover';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-semibold text-lg">{movie.title}</h3>
          <p className="text-gray-300 text-sm">
            {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A'}
          </p>
          <div className="flex items-center mt-1">
            <span className="text-yellow-400">★</span>
            <span className="text-white ml-1">
              {movie.averageRating ? movie.averageRating.toFixed(1) : 'N/A'}
            </span>
            {movie.ratingCount && (
              <span className="text-gray-300 text-sm ml-2">
                ({movie.ratingCount.toLocaleString()})
              </span>
            )}
          </div>
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {movie.genres.slice(0, 2).map((genre, index) => (
                <span key={index} className="text-xs px-2 py-1 bg-white/20 rounded-full text-white">
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;