import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Loader2, Music, Users, Star } from 'lucide-react';
import MusicCard from '../components/ui/MusicCard';
import Button from '../components/ui/Button';
import GenreFilter from '../components/ui/GenreFilter';
import { searchMusic, getPopularMusic, getSongsByArtist, Content } from '@/services/api';
import { Content as AppContent } from '../types'; // Import Content type from types
import SearchBar from '../components/layout/SearchBar';

const MusicPage: React.FC = () => {
  const [music, setMusic] = useState<AppContent[]>([]);
  const [allMusic, setAllMusic] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const [searchMode, setSearchMode] = useState<'all' | 'artist'>('all');
  const [stats, setStats] = useState({
    totalTracks: 0,
    totalArtists: 0,
    averageRating: 0
  });

  const observer = useRef<IntersectionObserver>();
  const lastMusicElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const loadMusic = useCallback(async (page: number, query: string = '', mode: 'all' | 'artist' = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      let response: Content[] = [];
      
      if (mode === 'artist' && query.trim()) {
        // Search for songs by specific artist
        response = await getSongsByArtist(query, 50);
        setSearchMode('artist');
      } else {
        // Regular music search - call backend directly
        const params = new URLSearchParams({
          query,
          page: page.toString(),
          limit: '20'
        });
        
        const apiResponse = await fetch(`http://localhost:5000/api/music?${params}`);
        if (!apiResponse.ok) {
          throw new Error(`HTTP error! status: ${apiResponse.status}`);
        }
        
        const data = await apiResponse.json();
        response = data.music || [];
        setSearchMode('all');
      }
      
      if (page === 1) {
        setMusic(response);
        setAllMusic(response);
        
        // Extract all unique genres from the loaded music
        const genres = new Set<string>();
        response.forEach((item: any) => {
          if (item.genres) {
            item.genres.forEach((genre: string) => genres.add(genre));
          }
        });
        setAllGenres(Array.from(genres).sort());
        
        // Calculate stats
        if (response.length > 0) {
          const artists = new Set<string>();
          let totalRating = 0;
          response.forEach((item: any) => {
            if (item.authors) {
              item.authors.forEach((artist: string) => artists.add(artist));
            }
            totalRating += item.averageRating || 0;
          });
          
          setStats({
            totalTracks: response.length,
            totalArtists: artists.size,
            averageRating: totalRating / response.length
          });
        }
      } else {
        setMusic(prev => [...prev, ...response]);
        setAllMusic(prev => [...prev, ...response]);
        
        // Update genres with new music
        const genres = new Set<string>(allGenres);
        response.forEach((item: any) => {
          if (item.genres) {
            item.genres.forEach((genre: string) => genres.add(genre));
          }
        });
        setAllGenres(Array.from(genres).sort());
      }
      
      // For artist search, we don't have pagination info, so check length
      if (mode === 'artist') {
        setHasMore(response.length === 50);
      } else {
        // For regular search, use the backend's hasMore property
        const apiResponse = await fetch(`http://localhost:5000/api/music?${new URLSearchParams({
          query,
          page: page.toString(),
          limit: '20'
        })}`);
        if (apiResponse.ok) {
          const data = await apiResponse.json();
          setHasMore(data.hasMore || false);
        } else {
          setHasMore(response.length === 20);
        }
      }
    } catch (err) {
      setError('Failed to load music');
      console.error('Error loading music:', err);
    } finally {
      setLoading(false);
    }
  }, [allGenres]);

  useEffect(() => {
    fetch('http://localhost:5000/api/music/popular')
      .then(res => res.json())
      .then(data => setMusic(data.music || []));
  }, []);

  useEffect(() => {
    loadMusic(1, '', 'all');
  }, []);

  useEffect(() => {
    if (currentPage > 1) {
      loadMusic(currentPage, searchQuery, searchMode);
    }
  }, [currentPage, loadMusic, searchQuery, searchMode]);

  useEffect(() => {
    // Debug log
    console.log('Loaded music:', music);
  }, [music]);

  // Filter music based on selected genres
  const filteredMusic = useCallback(() => {
    if (selectedGenres.length === 0) {
      return music;
    }
    
    return music.filter(item => 
      item.genres && item.genres.some(genre => selectedGenres.includes(genre))
    );
  }, [music, selectedGenres]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setCurrentPage(1);
    setMusic([]);
    setAllMusic([]);
    setHasMore(true);
    setSelectedGenres([]);
    
    try {
      // Try to load as artist first, then fallback to general search
      await loadMusic(1, searchQuery, 'artist');
    } catch (err) {
      // If artist search fails, try general search
      await loadMusic(1, searchQuery, 'all');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    setMusic([]);
    setAllMusic([]);
    setHasMore(true);
    setSelectedGenres([]);
    setSearchMode('all');
    loadMusic(1, '', 'all');
  };

  const handleGenreChange = async (genres: string[]) => {
    setSelectedGenres(genres);

    // If "All Genres" is selected (empty string), load all music
    if (!genres[0]) {
      setCurrentPage(1);
      setMusic([]);
      setAllMusic([]);
      setHasMore(true);
      await loadMusic(1, '', 'all');
      return;
    }

    // Fetch music filtered by genre from the backend
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        genre: genres[0],
        page: '1',
        limit: '20'
      });
      const apiResponse = await fetch(`http://localhost:5000/api/music?${params}`);
      if (!apiResponse.ok) {
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }
      const data = await apiResponse.json();
      setMusic(data.music || []);
      setAllMusic(data.music || []);
      setHasMore(data.hasMore || false);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to load music for this genre');
      console.error('Error loading music by genre:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderMusicCard = (item: AppContent, index: number) => {
    const filteredList = filteredMusic();
    if (filteredList.length === index + 1) {
      return (
        <div key={item.id} ref={lastMusicElementRef}>
          <MusicCard content={item} />
        </div>
      );
    } else {
      return (
        <div key={item.id}>
          <MusicCard content={item} />
        </div>
      );
    }
  };

  const currentMusic: AppContent[] = filteredMusic();

  console.log('Music state:', music);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-700 to-indigo-900 py-16 mb-8">
        <div className="container mx-auto px-4 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">🎵 Discover Music</h1>
          <p className="text-lg md:text-xl text-indigo-100 mb-8 max-w-2xl">Explore trending tracks, timeless classics, and hidden gems. Search by song, artist, or genre.</p>
          {/* Search bar removed */}
          {allGenres.length > 0 && (
            <div className="mt-6">
              <select
                aria-label="Select music genre"
                className="px-4 py-2 rounded bg-white text-gray-900 shadow"
                value={selectedGenres[0] || ''}
                onChange={e => handleGenreChange([e.target.value])}
              >
                <option value="">All Genres</option>
                {allGenres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Music Grid */}
      <div className="container mx-auto px-4 pb-16">
        {error && (
          <div className="bg-red-100 text-red-800 rounded-lg p-4 mb-6 text-center">{error}</div>
        )}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-800/40 rounded-lg h-64" />
            ))}
          </div>
        ) : music.length === 0 ? (
          <div className="text-center py-24 text-indigo-100 text-xl font-semibold">No music found. Try a different search or genre.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {music.map((item, index) =>
              index === music.length - 1 && hasMore ? (
                <div key={item.id} ref={lastMusicElementRef}>
                  <MusicCard content={item} />
                </div>
              ) : (
                <MusicCard key={item.id} content={item} />
              )
            )}
          </div>
        )}
        {loading && hasMore && (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-indigo-400" size={32} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicPage;