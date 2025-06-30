import React from 'react';
import { X, Users } from 'lucide-react';
import Button from './Button';

interface CastMember {
  name: string;
  character: string;
  order: number;
}

interface CastModalProps {
  isOpen: boolean;
  onClose: () => void;
  cast: CastMember[];
  movieTitle: string;
}

const CastModal: React.FC<CastModalProps> = ({ isOpen, onClose, cast, movieTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Cast & Crew
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {movieTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close cast modal"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {cast.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No cast information available
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cast.map((member, index) => (
                <div 
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer transition-all duration-200 hover:bg-purple-100 dark:hover:bg-purple-800 hover:scale-105 shadow-md hover:shadow-xl border border-transparent hover:border-purple-400"
                  onClick={() => {
                    // Redirect to search page for this actor
                    const searchUrl = `/search?q=${encodeURIComponent(member.name)}`;
                    window.location.href = searchUrl;
                  }}
                  title={`View all content for ${member.name}`}
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {member.order + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {member.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      as {member.character}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CastModal; 