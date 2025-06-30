import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import Button from './Button';

interface GenreFilterProps {
  allGenres: string[];
  selectedGenres: string[];
  onGenreChange: (genres: string[]) => void;
  className?: string;
}

const GenreFilter: React.FC<GenreFilterProps> = ({
  allGenres,
  selectedGenres,
  onGenreChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleGenreToggle = (genre: string) => {
    const newSelectedGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter(g => g !== genre)
      : [...selectedGenres, genre];
    onGenreChange(newSelectedGenres);
  };

  const handleClearAll = () => {
    onGenreChange([]);
  };

  const handleSelectAll = () => {
    onGenreChange([...allGenres]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.genre-filter-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative genre-filter-dropdown ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
      >
        <Filter size={16} />
        <span>Filter by Genre</span>
        {selectedGenres.length > 0 && (
          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
            {selectedGenres.length}
          </span>
        )}
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[999] min-w-64 max-h-96 overflow-y-auto" style={{zIndex: 9999}}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Genres</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  Select All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClearAll}
                  className="text-xs"
                >
                  Clear
                </Button>
              </div>
            </div>
            
            {selectedGenres.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {selectedGenres.map(genre => (
                  <span
                    key={genre}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs"
                  >
                    {genre}
                    <button
                      onClick={() => handleGenreToggle(genre)}
                      className="hover:text-purple-600 dark:hover:text-purple-300"
                      aria-label={`Remove ${genre} filter`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="p-2">
            <div className="grid grid-cols-1 gap-1">
              {allGenres.map(genre => (
                <label
                  key={genre}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre)}
                    onChange={() => handleGenreToggle(genre)}
                    className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 dark:focus:ring-purple-400"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {genre}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenreFilter; 