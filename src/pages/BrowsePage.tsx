import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ContentGrid from '../components/ui/ContentGrid';
import GenreFilter from '../components/ui/GenreFilter';
import { Film, BookOpen, Music, Mic, Newspaper } from 'lucide-react';
import { ContentType } from '../types';

const PAGE_SIZE = 20;

const BrowsePage: React.FC = () => {
  const { type } = useParams<{ type?: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');
  const [contents, setContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [allGenres, setAllGenres] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      let url = '';
      if (searchQuery) {
        // Search all types
        url = `/api/${type || 'contents'}/search?q=${encodeURIComponent(searchQuery)}`;
      } else if (type === 'movie') {
        url = `/api/movies?query=popular`;
      } else if (type === 'book') {
        url = `/api/books?query=popular`;
      } else if (type === 'music') {
        url = `/api/music?query=popular`;
      } else {
        url = `/api/contents`;
      }
      const res = await fetch(`http://localhost:5000${url}`);
      const data = await res.json();
      let items = data.contents || data.movies || data.books || data.music || [];
      setContents(items);
      
      // Extract all unique genres from the loaded content
      const genres = new Set<string>();
      items.forEach((item: any) => {
        if (item.genres) {
          item.genres.forEach((genre: string) => genres.add(genre));
        }
      });
      setAllGenres(Array.from(genres).sort());
      
      setIsLoading(false);
    }
    fetchData();
  }, [type, searchQuery]);

  // Filter contents based on selected genres
  const filteredContents = selectedGenres.length === 0 
    ? contents 
    : contents.filter((item: any) => 
        item.genres && item.genres.some((genre: string) => selectedGenres.includes(genre))
      );

  // Pagination logic
  const totalPages = Math.ceil(filteredContents.length / PAGE_SIZE);
  const paginatedContents = filteredContents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleGenreChange = (genres: string[]) => {
    setSelectedGenres(genres);
    setPage(1); // Reset to first page when filtering
  };

  const contentTypeIcons = {
    movie: <Film size={24} className="mr-2" />,
    book: <BookOpen size={24} className="mr-2" />,
    music: <Music size={24} className="mr-2" />,
    podcast: <Mic size={24} className="mr-2" />,
    article: <Newspaper size={24} className="mr-2" />,
  };

  const contentTypeNames = {
    movie: 'Movies',
    book: 'Books',
    music: 'Music',
    podcast: 'Podcasts',
    article: 'Articles',
  };

  const contentTypeDescriptions = {
    movie: 'Explore the latest blockbusters, timeless classics, and indie gems.',
    book: 'Discover bestsellers, literary masterpieces, and hidden gems across all genres.',
    music: 'Find amazing albums, singles, and artists across all genres and eras.',
    podcast: 'Listen to fascinating conversations, stories, and educational content.',
    article: 'Read insightful writing from top publications and independent authors.',
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="h-12 w-12 border-4 border-t-indigo-600 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  const title = searchQuery
    ? `Search results for "${searchQuery}"`
    : type
    ? contentTypeNames[type as keyof typeof contentTypeNames] || 'Browse'
    : 'All Content';

  const description = searchQuery
    ? `Showing all results matching "${searchQuery}"`
    : type
    ? contentTypeDescriptions[type as keyof typeof contentTypeDescriptions] || ''
    : 'Explore all types of content in our library.';

  return (
    <div className="min-h-screen">
      <div className="bg-indigo-600 dark:bg-indigo-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center mb-4">
                {type && contentTypeIcons[type as keyof typeof contentTypeIcons]}
                <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
              </div>
              <p className="text-indigo-100 max-w-2xl">{description}</p>
            </div>
            
            {/* Genre Filter */}
            {allGenres.length > 0 && (
              <div className="flex-shrink-0">
                <GenreFilter
                  allGenres={allGenres}
                  selectedGenres={selectedGenres}
                  onGenreChange={handleGenreChange}
                  className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        {/* Results Summary */}
        {selectedGenres.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Showing {filteredContents.length} item{filteredContents.length !== 1 ? 's' : ''} in {selectedGenres.join(', ')}
            </p>
          </div>
        )}

        {paginatedContents.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              {selectedGenres.length > 0 ? 'No content found in selected genres' : 'No content found'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery
                ? `We couldn't find any content matching "${searchQuery}"`
                : selectedGenres.length > 0
                ? 'Try selecting different genres or browse all content.'
                : 'There is no content available in this category yet.'}
            </p>
          </div>
        ) : (
          <>
            <ContentGrid contents={paginatedContents} />
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;