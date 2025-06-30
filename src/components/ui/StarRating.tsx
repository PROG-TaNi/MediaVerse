import React from 'react';
import { Star } from 'lucide-react';
import { generateStarRating } from '../../utils/formatters';

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 20,
  interactive = false,
  onRatingChange,
}) => {
  const [hoveredRating, setHoveredRating] = React.useState(0);
  const stars = generateStarRating(interactive ? hoveredRating || rating : rating);

  const handleClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <div className="flex items-center" aria-label={`Rating: ${rating} out of 10`}>
      {stars.map((type, index) => (
        <span
          key={index}
          onClick={() => handleClick(index)}
          onMouseEnter={() => interactive && setHoveredRating(index + 1)}
          onMouseLeave={() => interactive && setHoveredRating(0)}
          className={`${interactive ? 'cursor-pointer' : ''}`}
          aria-label={interactive ? `Set rating to ${index + 1} out of 10` : undefined}
        >
          {type === 'full' ? (
            <Star 
              size={size} 
              fill="#FFD700" 
              color="#FFD700" 
              className="transition-colors duration-200" 
            />
          ) : type === 'half' ? (
            <div className="relative">
              <Star size={size} color="#FFD700" />
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <Star size={size} fill="#FFD700" color="#FFD700" />
              </div>
            </div>
          ) : (
            <Star 
              size={size} 
              color="#d1d5db" 
              className="transition-colors duration-200" 
            />
          )}
        </span>
      ))}
    </div>
  );
};

export default StarRating;