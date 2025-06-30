import React, { useEffect, useRef } from 'react';
import { Content } from '../../types';
import ContentCard from './ContentCard';

interface HorizontalScrollProps {
  items: Content[];
  title: string;
  subtitle?: string;
  type: 'movies' | 'books' | 'music';
  className?: string;
}

const HorizontalScroll: React.FC<HorizontalScrollProps> = ({
  items,
  title,
  subtitle,
  type,
  className = ''
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current || !containerRef.current) return;

    const scrollContainer = scrollRef.current;
    const container = containerRef.current;
    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame

    const animate = () => {
      scrollPosition += scrollSpeed;
      
      // Reset position when we've scrolled the width of one item set
      const itemWidth = container.scrollWidth / 2;
      if (scrollPosition >= itemWidth) {
        scrollPosition = 0;
      }
      
      scrollContainer.style.transform = `translateX(-${scrollPosition}px)`;
      animationId = requestAnimationFrame(animate);
    };

    // Start animation after a delay
    const startDelay = setTimeout(() => {
      animationId = requestAnimationFrame(animate);
    }, 2000);

    // Pause animation on hover
    const handleMouseEnter = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };

    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(animate);
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(startDelay);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [items]);

  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items];

  return (
    <div className={`mb-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        
        <div 
          ref={containerRef}
          className="relative overflow-hidden"
        >
          <div 
            ref={scrollRef}
            className="flex gap-6 transition-transform duration-1000 ease-linear"
            style={{ width: 'max-content' }}
          >
            {duplicatedItems.map((item, index) => (
              <div 
                key={`${item.id}-${index}`}
                className="flex-shrink-0 w-64"
              >
                <ContentCard content={item} />
              </div>
            ))}
          </div>
          
          {/* Gradient overlays for smooth edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 dark:from-gray-900 to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </div>
  );
};

export default HorizontalScroll; 