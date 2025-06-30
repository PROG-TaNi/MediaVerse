const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const router = express.Router();

// Spotify API configuration
const SPOTIFY_CLIENT_ID = 'your_spotify_client_id'; // You'll need to get this from Spotify Developer Dashboard
const SPOTIFY_CLIENT_SECRET = 'your_spotify_client_secret';

// Try to import Content model (optional)
let Content;
try {
  Content = require('../models/Content');
} catch (error) {
  console.log("⚠️  Content model not available, running without database");
}

// Load and parse Spotify dataset
let spotifyData = [];

// Function to get Spotify access token
async function getSpotifyToken() {
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Spotify token:', error.message);
    return null;
  }
}

// Function to get album cover from Spotify
async function getAlbumCover(trackName, artistName, albumName) {
  try {
    const token = await getSpotifyToken();
    if (!token) return null;

    // Search for the track
    const searchQuery = `${trackName} ${artistName}`;
    const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=1`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.tracks.items.length > 0) {
      const track = response.data.tracks.items[0];
      return track.album.images[0]?.url || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching album cover:', error.message);
    return null;
  }
}

function loadSpotifyData() {
  try {
    const csvPath = path.join(__dirname, '..', '..', 'high_popularity_spotify_data.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    
    // Helper function to properly parse CSV line
    function parseCSVLine(line) {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    }
    
    spotifyData = lines.slice(1).filter(line => line.trim()).map((line, index) => {
      const values = parseCSVLine(line);
      const track = {};
      
      headers.forEach((header, i) => {
        let value = values[i] || '';
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        track[header.trim()] = value;
      });
      
      // Use fallback music image if no cover available
      // const fallbackCover = path.join(__dirname, '..', '..', 'music.png');
      // const coverUrl = `file://${fallbackCover}`;
      // const coverUrl = '/music.png';
      
      // Generate better album covers using different Unsplash images based on genre
      const genre = track.playlist_genre || 'pop';
      let coverUrl;
      
      // Different Unsplash images for different genres
      const genreImages = {
        'pop': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
        'rock': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
        'hip-hop': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
        'r&b': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
        'edm': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
        'latin': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
        'rap': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
        'indie': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
        'alternative': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
        'country': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
        'jazz': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
        'classical': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
        'blues': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
        'folk': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
        'reggae': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
        'punk': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
        'metal': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
        'electronic': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
        'soul': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
        'funk': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d'
      };
      
      const baseImage = genreImages[genre.toLowerCase()] || genreImages['pop'];
      coverUrl = `${baseImage}?w=300&h=300&fit=crop&crop=center&auto=format&dpr=2&q=80&sig=${index}`;
      
      return {
        id: index + 1,
        title: track.track_name || 'Unknown Track',
        artists: track.track_artist ? track.track_artist.split(', ') : ['Unknown Artist'],
        album: track.track_album_name || 'Unknown Album',
        release_date: track.track_album_release_date || 'Unknown',
        rating: parseFloat(track.track_popularity) / 20 || 4.0, // Convert popularity (0-100) to rating (0-5)
        ratingCount: Math.floor(Math.random() * 1000) + 100, // Generate random rating count
        cover: coverUrl,
        genre: track.playlist_genre || 'pop',
        energy: parseFloat(track.energy) || 0.5,
        danceability: parseFloat(track.danceability) || 0.5,
        tempo: parseFloat(track.tempo) || 120,
        duration_ms: parseInt(track.duration_ms) || 180000,
        spotify_id: track.track_id || '',
        spotify_uri: track.uri || '',
        artist_search: track.track_artist ? track.track_artist.split(', ')[0] : 'Unknown Artist' // For artist search
      };
    });
    
    console.log(`📊 Loaded ${spotifyData.length} tracks from Spotify dataset`);
  } catch (error) {
    console.error('❌ Error loading Spotify dataset:', error.message);
    // Fallback to sample data if CSV loading fails
    spotifyData = [
      {
        id: 1,
        title: "Bohemian Rhapsody",
        artists: ["Queen"],
        album: "A Night at the Opera",
        release_date: "1975-10-31",
        rating: 4.8,
        ratingCount: 1250,
        cover: path.join(__dirname, '..', '..', 'music.png'),
        genre: "rock",
        energy: 0.6,
        danceability: 0.5,
        tempo: 145,
        duration_ms: 354000,
        spotify_id: "3z8h0TU7ReDPLIbEnYhWZb",
        spotify_uri: "spotify:track:3z8h0TU7ReDPLIbEnYhWZb"
      }
    ];
  }
}

// Load data on startup
loadSpotifyData();

// Helper: Map music data to Content schema
function mapMusicToContent(music) {
  return {
    type: 'music',
    title: music.title,
    description: `${music.title} by ${music.artists.join(', ')} from the album "${music.album}" (${music.genre})`,
    genres: [music.genre],
    authors: music.artists,
    releaseDate: music.release_date,
    externalId: music.id.toString(),
    rating: music.rating,
    ratingCount: music.ratingCount,
    views: music.ratingCount * 10, // Estimate views
    metadata: {
      album: music.album,
      cover: music.cover,
      preview: '',
      spotifyUrl: `https://open.spotify.com/track/${music.spotify_id}`,
      energy: music.energy,
      danceability: music.danceability,
      tempo: music.tempo,
      duration_ms: music.duration_ms,
      spotify_uri: music.spotify_uri
    },
    createdAt: new Date(),
  };
}

function mapContentForFrontend(content) {
  return {
    id: content.externalId,
    type: content.type,
    title: content.title,
    description: content.description,
    authors: content.authors || [],
    genres: content.genres || [],
    releaseDate: content.releaseDate,
    coverImageUrl: content.metadata?.cover || '',
    averageRating: content.rating || 0,
    ratingCount: content.ratingCount || 0,
    views: content.views || 0,
    metadata: content.metadata || {},
    createdAt: content.createdAt,
    // Additional fields for compatibility
    album: content.metadata?.album,
    artists: content.authors || [],
    release_date: content.releaseDate
  };
}

// GET /api/music?query=... - search music
router.get('/', async (req, res) => {
  const { query, limit = 20, genre, sort = 'popularity' } = req.query;
  
  try {
    let filteredMusic = [...spotifyData];
    
    // Apply search filter if query provided
    if (query) {
      const searchTerm = query.toLowerCase();
      filteredMusic = spotifyData.filter(track => 
        track.title.toLowerCase().includes(searchTerm) ||
        (Array.isArray(track.artists) && track.artists.some(artist => artist.toLowerCase().includes(searchTerm))) ||
        track.album.toLowerCase().includes(searchTerm) ||
        track.genre.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply genre filter if provided
    if (genre) {
      filteredMusic = filteredMusic.filter(music => 
        music.genre.toLowerCase() === genre.toLowerCase()
      );
    }
    
    // Sort results
    switch (sort) {
      case 'popularity':
        filteredMusic.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filteredMusic.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
        break;
      case 'energy':
        filteredMusic.sort((a, b) => b.energy - a.energy);
        break;
      case 'danceability':
        filteredMusic.sort((a, b) => b.danceability - a.danceability);
        break;
      default:
        filteredMusic.sort((a, b) => b.rating - a.rating);
    }
    
    // Limit results
    filteredMusic = filteredMusic.slice(0, parseInt(limit));
    
    // Convert to Content format
    const contentMusic = filteredMusic.map(mapMusicToContent);
    
    // Cache in MongoDB (optional)
    if (Content) {
      await Content.insertMany(contentMusic, { ordered: false }).catch(() => {});
    }
    
    res.json({ 
      music: contentMusic.map(mapContentForFrontend),
      total: filteredMusic.length,
      message: `Found ${filteredMusic.length} tracks from Spotify dataset`
    });
    
  } catch (error) {
    console.error('Music fetch error:', error.message);
    res.status(500).json({ message: 'Failed to fetch music' });
  }
});

// GET /api/music/popular - get popular music
router.get('/popular', async (req, res) => {
  try {
    // Sort by rating and get top tracks
    const popularMusic = spotifyData
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10)
      .map(mapMusicToContent);
    
    res.json({ 
      music: popularMusic.map(mapContentForFrontend),
      message: "Top rated tracks from Spotify dataset"
    });
    
  } catch (error) {
    console.error('Popular music fetch error:', error.message);
    res.status(500).json({ message: 'Failed to fetch popular music' });
  }
});

// GET /api/music/genres - get available genres
router.get('/genres', async (req, res) => {
  try {
    const genres = [...new Set(spotifyData.map(track => track.genre))].sort();
    res.json({ 
      genres,
      message: "Available genres from Spotify dataset"
    });
  } catch (error) {
    console.error('Genres fetch error:', error.message);
    res.status(500).json({ message: 'Failed to fetch genres' });
  }
});

// GET /api/music/:id - get music by ID
router.get('/:id', async (req, res) => {
  try {
    const music = spotifyData.find(m => m.id.toString() === req.params.id);
    
    if (!music) {
      return res.status(404).json({ message: 'Music not found' });
    }
    
    const contentMusic = mapMusicToContent(music);
    res.json({ music: mapContentForFrontend(contentMusic) });
    
  } catch (error) {
    console.error('Music fetch error:', error.message);
    res.status(500).json({ message: 'Failed to fetch music' });
  }
});

// GET /api/music/artist/:artistName - get songs by artist
router.get('/artist/:artistName', async (req, res) => {
  try {
    const { artistName } = req.params;
    const { limit = 50 } = req.query;
    
    // Decode the artist name
    const decodedArtistName = decodeURIComponent(artistName);
    
    // Filter songs by artist (case-insensitive search)
    const artistSongs = spotifyData.filter(music => 
      music.artists.some(artist => 
        artist.toLowerCase().includes(decodedArtistName.toLowerCase())
      )
    );
    
    // Sort by popularity
    artistSongs.sort((a, b) => b.rating - a.rating);
    
    // Limit results
    const limitedSongs = artistSongs.slice(0, parseInt(limit));
    
    // Convert to Content format
    const contentMusic = limitedSongs.map(mapMusicToContent);
    
    res.json({ 
      music: contentMusic.map(mapContentForFrontend),
      total: artistSongs.length,
      artist: decodedArtistName,
      message: `Found ${limitedSongs.length} tracks by ${decodedArtistName}`
    });
    
  } catch (error) {
    console.error('Artist songs fetch error:', error.message);
    res.status(500).json({ message: 'Failed to fetch artist songs' });
  }
});

// GET /api/music/artists - get all unique artists
router.get('/artists', async (req, res) => {
  try {
    const artists = new Set();
    
    spotifyData.forEach(track => {
      track.artists.forEach(artist => {
        artists.add(artist);
      });
    });
    
    const uniqueArtists = Array.from(artists).sort();
    
    res.json({ 
      artists: uniqueArtists,
      total: uniqueArtists.length,
      message: "All artists from Spotify dataset"
    });
  } catch (error) {
    console.error('Artists fetch error:', error.message);
    res.status(500).json({ message: 'Failed to fetch artists' });
  }
});

module.exports = router; 