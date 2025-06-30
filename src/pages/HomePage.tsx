import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Film, Music, Mic, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContentStore } from '../store/contentStore';
import { Content } from '../types';
import ContentGrid from '../components/ui/ContentGrid';
import HorizontalScroll from '../components/ui/HorizontalScroll';
import MusicHorizontalScroll from '../components/ui/MusicHorizontalScroll';
import Button from '../components/ui/Button';
import MoodGrid from '../components/ui/MoodGrid';
import FloatingIcons from '../components/ui/FloatingIcons';

const HomePage: React.FC = () => {
  const { fetchContents } = useContentStore();

  // Local state for each type
  const [movies, setMovies] = useState<Content[]>([]);
  const [books, setBooks] = useState<Content[]>([]);
  const [music, setMusic] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        
        // Fetch content for each type
        const [moviesData, booksData, musicData] = await Promise.all([
          fetchContents('movie', 20),
          fetchContents('book', 20),
          fetchContents('music', 20)
        ]);
        
        setMovies(moviesData);
        setBooks(booksData);
        setMusic(musicData);
        
        // Trigger animations
        setTimeout(() => setAnimateIn(true), 100);
      } catch (error) {
        console.error('Error loading content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [fetchContents]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  // Fallback: ensure arrays are always defined
  const safeMovies = Array.isArray(movies) ? movies : [];
  const safeBooks = Array.isArray(books) ? books : [];
  const safeMusic = Array.isArray(music) ? music : [];

  // Show error if all are empty (API failed)
  if (!safeMovies.length && !safeBooks.length && !safeMusic.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Failed to load content. Please check your server and refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 bg-pattern">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 text-white py-20 overflow-hidden">
        <FloatingIcons />
        <div className="container mx-auto px-4 text-center">
          <div className={`transition-all duration-1000 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Welcome to MediaVerse
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-100 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Discover, explore, and enjoy the best in movies, books, and music
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Link to="/movies">
                <Button size="lg" className="bg-purple-600 text-white hover:bg-purple-700 hover:text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <Film size={20} className="mr-2" />
                  Explore Movies
                </Button>
              </Link>
              <Link to="/books">
                <Button size="lg" variant="outline" className="border-purple-600 text-white hover:bg-purple-700 hover:text-white dark:border-purple-400 dark:text-white dark:hover:bg-purple-700 dark:hover:text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <BookOpen size={20} className="mr-2" />
                  Explore Books
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 animate-float" style={{ animationDelay: '1s' }}>
            <Film size={40} className="text-white/30 drop-shadow-lg" />
          </div>
          <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '1.5s' }}>
            <BookOpen size={40} className="text-white/30 drop-shadow-lg" />
          </div>
          <div className="absolute bottom-20 left-20 animate-float" style={{ animationDelay: '2s' }}>
            <Music size={40} className="text-white/30 drop-shadow-lg" />
          </div>
        </div>
      </section>

      {/* Explore by Category (existing section) */}
      {/* ... your existing category grid ... */}

      {/* Explore Mood Section */}
      <MoodGrid />

      {/* Content Sections */}
      <div className="py-12">
        {/* Movies Section */}
        {safeMovies.length > 0 && (
          <HorizontalScroll
            items={safeMovies}
            title="Trending Movies"
            subtitle="The latest and greatest films everyone's talking about"
            type="movies"
            className="animate-fade-in"
          />
        )}

        {/* Books Section */}
        {safeBooks.length > 0 && (
          <HorizontalScroll
            items={safeBooks}
            title="Popular Books"
            subtitle="Bestsellers and critically acclaimed reads"
            type="books"
            className="animate-fade-in"
          />
        )}

        {/* Music Section - Single Row */}
        {safeMusic.length > 0 && (
          <MusicHorizontalScroll
            items={safeMusic}
            title="Top Music"
            subtitle="Chart-topping hits and timeless classics"
            className="animate-fade-in"
          />
        )}

        {/* Call to Action */}
        <div className="container mx-auto px-4 text-center animate-fade-in" style={{ animationDelay: '1.2s' }}>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">
              Ready to explore more?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              Join thousands of users discovering amazing content every day
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/movies">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <Film size={18} className="mr-2" />
                  Browse Movies
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link to="/books">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <BookOpen size={18} className="mr-2" />
                  Explore Books
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link to="/music">
                <Button className="bg-pink-600 hover:bg-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <Music size={18} className="mr-2" />
                  Listen to Music
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;