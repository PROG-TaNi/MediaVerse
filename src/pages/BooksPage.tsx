import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import ContentCard from '../components/ui/ContentCard';
import Button from '../components/ui/Button';
import GenreFilter from '../components/ui/GenreFilter';
import { searchBooks, Content } from '@/services/api';

const BooksPage: React.FC = () => {
  const [books, setBooks] = useState<Content[]>([]);
  const [allBooks, setAllBooks] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [allGenres, setAllGenres] = useState<string[]>([]);

  const observer = useRef<IntersectionObserver>();
  const lastBookElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const loadBooks = useCallback(async (page: number, query: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the backend API directly to get the full response
      const params = new URLSearchParams({
        query,
        page: page.toString(),
        limit: '50'
      });
      
      const response = await fetch(`http://localhost:5000/api/books?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const books = data.books || [];
      
      if (page === 1) {
        setBooks(books);
        setAllBooks(books);
        
        // Extract all unique genres from the loaded books
        const genres = new Set<string>();
        books.forEach((book: any) => {
          if (book.genres) {
            book.genres.forEach((genre: string) => genres.add(genre));
          }
        });
        setAllGenres(Array.from(genres).sort());
      } else {
        setBooks(prev => [...prev, ...books]);
        setAllBooks(prev => [...prev, ...books]);
        
        // Update genres with new books
        const genres = new Set<string>(allGenres);
        books.forEach((book: any) => {
          if (book.genres) {
            book.genres.forEach((genre: string) => genres.add(genre));
          }
        });
        setAllGenres(Array.from(genres).sort());
      }
      
      // Use the backend's hasMore property
      setHasMore(data.hasMore || false);
      
    } catch (err) {
      setError('Failed to load books');
      console.error('Error loading books:', err);
    } finally {
      setLoading(false);
    }
  }, [allGenres]);

  useEffect(() => {
    loadBooks(1, searchQuery);
  }, []);

  useEffect(() => {
    if (currentPage > 1) {
      loadBooks(currentPage, searchQuery);
    }
  }, [currentPage, loadBooks, searchQuery]);

  // Filter books based on selected genres
  const filteredBooks = useCallback(() => {
    if (selectedGenres.length === 0) {
      return books;
    }
    
    return books.filter(book => 
      book.genres && book.genres.some(genre => selectedGenres.includes(genre))
    );
  }, [books, selectedGenres]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Navigate to search results page
    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    setBooks([]);
    setAllBooks([]);
    setHasMore(true);
    setSelectedGenres([]);
    loadBooks(1, '');
  };

  const handleGenreChange = (genres: string[]) => {
    setSelectedGenres(genres);
  };

  const renderBookCard = (book: Content, index: number) => {
    const filteredList = filteredBooks();
    if (filteredList.length === index + 1) {
      return (
        <div key={book.id} ref={lastBookElementRef}>
          <ContentCard content={book} />
        </div>
      );
    } else {
      return (
        <div key={book.id}>
          <ContentCard content={book} />
        </div>
      );
    }
  };

  const currentBooks = filteredBooks();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Books
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Discover and explore thousands of books
              </p>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <form onSubmit={handleSearch} className="flex gap-2 flex-1 sm:flex-initial">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isSearching}
                  className="px-6"
                >
                  {isSearching ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    'Search'
                  )}
                </Button>
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    onClick={handleClearSearch}
                    className="px-4"
                  >
                    Clear
                  </Button>
                )}
              </form>
              
              {/* Genre Filter */}
              {allGenres.length > 0 && (
                <GenreFilter
                  allGenres={allGenres}
                  selectedGenres={selectedGenres}
                  onGenreChange={handleGenreChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Results Summary */}
        {(searchQuery || selectedGenres.length > 0) && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Showing {currentBooks.length} book{currentBooks.length !== 1 ? 's' : ''}
              {searchQuery && ` for "${searchQuery}"`}
              {selectedGenres.length > 0 && ` in ${selectedGenres.join(', ')}`}
            </p>
          </div>
        )}

        {currentBooks.length === 0 && !loading && !isSearching && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <Search size={64} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery || selectedGenres.length > 0 ? 'No books found' : 'No books available'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery 
                ? `No books found for "${searchQuery}". Try a different search term.`
                : selectedGenres.length > 0
                ? `No books found in the selected genres. Try different genres.`
                : 'Check back later for new books.'
              }
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {currentBooks.map(renderBookCard)}
        </div>
        {loading && (
          <div className="flex justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="animate-spin" size={24} />
              <span className="text-gray-600 dark:text-gray-400">Loading more books...</span>
            </div>
          </div>
        )}
        {!hasMore && currentBooks.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery 
                ? `End of results for "${searchQuery}"`
                : selectedGenres.length > 0
                ? `End of results for selected genres`
                : 'You\'ve reached the end of all books'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BooksPage; 