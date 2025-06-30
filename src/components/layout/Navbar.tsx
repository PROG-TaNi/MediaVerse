import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Search, Menu, X, BookOpen, Film, Music, Mic, Newspaper, LogOut, User } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import { useContentStore } from '../../store/contentStore';
import { ContentType } from '../../types';
import SearchBar from './SearchBar';

const Navbar: React.FC = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { searchContents } = useContentStore();
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(() => {
    // Animate navbar on page load
    const timer = setTimeout(() => {
      setIsNavbarVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: number;
      return async (query: string) => {
        clearTimeout(timeoutId);
        if (query.trim().length < 2) {
          setSearchResults([]);
          setShowSearchResults(false);
          return;
        }
        
        timeoutId = setTimeout(async () => {
          setIsSearching(true);
          try {
            const results = await searchContents(query);
            setSearchResults(results.slice(0, 5));
            setShowSearchResults(true);
          } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
          } finally {
            setIsSearching(false);
          }
        }, 300);
      };
    })(),
    [searchContents]
  );
  
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);
  
  useEffect(() => {
    // Apply dark mode class to body
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };
  
  const handleResultClick = (id: string) => {
    navigate(`/content/${id}`);
    setSearchQuery('');
    setShowSearchResults(false);
  };
  
  const closeMenu = () => setIsMenuOpen(false);
  
  const contentTypeIcons = {
    movie: <Film size={16} className="mr-2" />,
    book: <BookOpen size={16} className="mr-2" />,
    music: <Music size={16} className="mr-2" />,
    podcast: <Mic size={16} className="mr-2" />,
    article: <Newspaper size={16} className="mr-2" />,
  };
  
  return (
    <header className={`sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 transition-all duration-700 ease-out transform ${
      isNavbarVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-montserrat tracking-tight">
              MediaVerse
            </h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
              Home
            </Link>
            <Link to="/browse/movie" className="font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
              Movies
            </Link>
            <Link to="/browse/book" className="font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
              Books
            </Link>
            <Link to="/music" className="font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
              Music
            </Link>
            <Link to="/browse/podcast" className="font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
              Podcasts
            </Link>
            <Link to="/browse/article" className="font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
              Articles
            </Link>
          </nav>
          
          {/* Search, Theme Toggle and Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Bar */}
            <SearchBar className="w-72" />
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Auth Buttons / User Menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 group">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center overflow-hidden">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`}
                        alt={user.name}
                        className="w-8 h-8 object-cover rounded-full"
                      />
                    ) : (
                      user?.name.charAt(0)
                    )}
                  </div>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-10 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transform transition-all origin-top-right">
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <User size={16} className="mr-2" /> Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    >
                      <LogOut size={16} className="mr-2" /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700 dark:text-gray-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 animate-slideDown">
          <div className="px-4 py-3">
            <div className="relative mb-3">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search content..."
                  className="py-2 pl-10 pr-4 w-full rounded-full bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <Search className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400" size={18} />
                {isSearching && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                  </div>
                )}
              </form>
              
              {/* Mobile Search Results */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-12 left-0 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  <div className="max-h-60 overflow-y-auto">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        onClick={() => {
                          handleResultClick(result.id);
                          closeMenu();
                        }}
                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                      >
                        {contentTypeIcons[result.type as ContentType]}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{result.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{result.type} • {result.authors?.[0] || 'Unknown'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <nav className="grid grid-cols-1 gap-2">
              <Link to="/" className="py-2 font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={closeMenu}>
                Home
              </Link>
              <Link to="/browse/movie" className="py-2 font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={closeMenu}>
                Movies
              </Link>
              <Link to="/browse/book" className="py-2 font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={closeMenu}>
                Books
              </Link>
              <Link to="/browse/music" className="py-2 font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={closeMenu}>
                Music
              </Link>
              <Link to="/browse/podcast" className="py-2 font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={closeMenu}>
                Podcasts
              </Link>
              <Link to="/browse/article" className="py-2 font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={closeMenu}>
                Articles
              </Link>
            </nav>
            
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              {isAuthenticated ? (
                <div className="flex space-x-2">
                  <Link to="/profile" onClick={closeMenu}>
                    <Button variant="outline" size="sm">Profile</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => {logout(); closeMenu();}}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link to="/login" onClick={closeMenu}>
                    <Button variant="outline" size="sm">Login</Button>
                  </Link>
                  <Link to="/signup" onClick={closeMenu}>
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;