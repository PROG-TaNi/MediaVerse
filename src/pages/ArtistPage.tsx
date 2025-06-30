import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Music, Star, Calendar, Users } from 'lucide-react';
import MusicCard from '../components/ui/MusicCard';
import { Content } from '../types';
import { getSongsByArtist } from '../services/api';

const ArtistPage: React.FC = () => {
  const { artistName } = useParams<{ artistName: string }>();
  const navigate = useNavigate();
  const [songs, setSongs] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [artistInfo, setArtistInfo] = useState<{
    name: string;
    totalSongs: number;
    averageRating: number;
    topGenres: string[];
  } | null>(null);

  useEffect(() => {
    const fetchArtistSongs = async () => {
      if (!artistName) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Use the getSongsByArtist function
        const artistSongs = await getSongsByArtist(decodeURIComponent(artistName), 100);
        
        setSongs(artistSongs);
        
        // Calculate artist info
        if (artistSongs.length > 0) {
          const totalSongs = artistSongs.length;
          const averageRating = artistSongs.reduce((sum: number, song: Content) => 
            sum + (song.averageRating || 0), 0) / artistSongs.length;
          
          // Get top genres
          const genreCount: { [key: string]: number } = {};
          artistSongs.forEach((song: Content) => {
            song.genres?.forEach(genre => {
              genreCount[genre] = (genreCount[genre] || 0) + 1;
            });
          });
          
          const topGenres = Object.entries(genreCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([genre]) => genre);
          
          setArtistInfo({
            name: decodeURIComponent(artistName),
            totalSongs,
            averageRating,
            topGenres
          });
        }
        
      } catch (err) {
        console.error('Error fetching artist songs:', err);
        setError('Failed to load artist songs');
      } finally {
        setLoading(false);
      }
    };

    fetchArtistSongs();
  }, [artistName]);

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading artist songs...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={handleBackClick}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          
          {artistInfo && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Music size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {artistInfo.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {artistInfo.totalSongs} songs available
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Music size={20} />
                  <span>{artistInfo.totalSongs} songs</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Star size={20} className="text-yellow-500" />
                  <span>{artistInfo.averageRating.toFixed(1)} avg rating</span>
                </div>
                
                {artistInfo.topGenres.length > 0 && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <span>Top genres: {artistInfo.topGenres.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Songs Grid */}
        {songs.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Songs by {artistInfo?.name}
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {songs.map((song) => (
                <MusicCard
                  key={song.id}
                  content={song}
                  className="w-full"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Music size={64} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No songs found
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              No songs were found for this artist.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistPage; 