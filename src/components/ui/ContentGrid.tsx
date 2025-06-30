import React from 'react';
import ContentCard from './ContentCard';
import { Content } from '../../types';
import { useAuthStore } from '../../store/authStore';

interface ContentGridProps {
  contents: Content[];
  title?: string;
  emptyMessage?: string;
  onToggleFavorite?: (contentId: string) => void;
  maxItems?: number;
}

const ContentGrid: React.FC<ContentGridProps> = ({
  contents,
  title,
  emptyMessage = 'No content available',
  onToggleFavorite,
  maxItems,
}) => {
  const { user, isAuthenticated } = useAuthStore();
  
  const checkIsFavorite = (contentId: string): boolean => {
    if (!isAuthenticated || !user) return false;
    
    const contentType = contents.find(c => c.id === contentId)?.type;
    if (!contentType) return false;
    
    return user.favorites[`${contentType}s` as keyof typeof user.favorites]?.includes(contentId) || false;
  };
  
  const displayContents = maxItems ? contents.slice(0, maxItems) : contents;
  
  return (
    <div className="py-6">
      {title && <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h2>}
      {displayContents.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">{emptyMessage}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {displayContents.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              isFavorite={checkIsFavorite(content.id)}
              onToggleFavorite={isAuthenticated ? onToggleFavorite : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentGrid;