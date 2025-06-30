const express = require('express');

// Import node-fetch for Node.js environments
let fetch;
(async () => {
  if (typeof globalThis.fetch === 'undefined') {
    const { default: nodeFetch } = await import('node-fetch');
    globalThis.fetch = nodeFetch;
  }
})();

const router = express.Router();

// Load API keys from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OMDB_API_KEY = process.env.OMDB_API_KEY; // Get free key from http://www.omdbapi.com/

if (!GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY not found in environment variables');
}

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

// Function to search for movie posters using OMDB API
async function getMoviePoster(movieTitle) {
  if (!OMDB_API_KEY) {
    return null;
  }
  
  try {
    const response = await fetch(`http://www.omdbapi.com/?t=${encodeURIComponent(movieTitle)}&apikey=${OMDB_API_KEY}`);
    const data = await response.json();
    
    if (data.Response === 'True' && data.Poster && data.Poster !== 'N/A') {
      return {
        title: data.Title,
        year: data.Year,
        poster: data.Poster,
        imdbRating: data.imdbRating,
        genre: data.Genre,
        director: data.Director
      };
    }
  } catch (error) {
    console.error('Error fetching movie poster:', error);
  }
  
  return null;
}

// Function to extract movie titles from Gemini response
function extractMovieTitles(text) {
  // Enhanced regex patterns to catch movie titles
  const patterns = [
    /"([^"]+)"/g, // Titles in quotes
    /\*\*([^*]+)\*\*/g, // Titles in bold markdown
    /\*([^*]+)\*/g, // Titles in italic markdown
    /(?:movie|film|watch|recommend)s?\s+(?:like\s+)?["']?([^"'\n.!?]+)["']?/gi, // Context-based extraction
    /^\d+\.\s*([^(\n]+)(?:\s*\([^)]+\))?/gm, // Numbered lists
    /^-\s*([^(\n]+)(?:\s*\([^)]+\))?/gm, // Bullet points
  ];
  
  const titles = new Set();
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const title = match[1].trim();
      if (title.length > 2 && title.length < 100 && !title.includes('http')) {
        // Clean up the title
        const cleanTitle = title
          .replace(/^\d+\.\s*/, '') // Remove numbering
          .replace(/^-\s*/, '') // Remove bullet points
          .replace(/\s*\([^)]*\)$/, '') // Remove year in parentheses
          .trim();
        
        if (cleanTitle.length > 2) {
          titles.add(cleanTitle);
        }
      }
    }
  });
  
  return Array.from(titles).slice(0, 5); // Limit to 5 movies max
}

// Function to build conversation context for Gemini API
function buildConversationContext(conversationHistory) {
  if (!conversationHistory || conversationHistory.length === 0) {
    return [];
  }

  const contents = [];
  
  // Add conversation history in the format Gemini expects
  conversationHistory.forEach((message) => {
    if (message.role === 'user') {
      contents.push({
        role: 'user',
        parts: [{ text: message.text }]
      });
    } else if (message.role === 'ai') {
      contents.push({
        role: 'model',
        parts: [{ text: message.text }]
      });
    }
  });

  return contents;
}

router.post('/', async (req, res) => {
  console.log('Gemini API endpoint hit with body:', req.body);
  
  const { prompt, conversationHistory } = req.body;
  
  if (!prompt) {
    console.log('No prompt provided');
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  if (!GEMINI_API_KEY) {
    console.log('No API key configured');
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  try {
    console.log('Making request to Gemini API...');
    console.log('Conversation history length:', conversationHistory?.length || 0);
    
    // Enhanced prompt to encourage movie recommendations with clear formatting
    const enhancedPrompt = `You are CineBot, a fun and cute bot who loves cinema, music, and books! Be enthusiastic and playful. Try to use Emojis to make things exciting, try making some satirical joke about movie sometimes when someone ask for a specific movie, and always keep your answers short unless ask for elaboration. When you recommend a movie, song, or book, enclose titles in quotes. Remember our previous conversation and build upon it naturally.\nUser: ${prompt}`;
    
    // Build conversation context
    const conversationContents = buildConversationContext(conversationHistory || []);
    
    // Add the current prompt with enhanced instructions only for the first message or if no history
    const currentMessage = {
      role: 'user',
      parts: [{ 
        text: conversationHistory && conversationHistory.length > 0 ? prompt : enhancedPrompt
      }]
    };

    // Combine conversation history with current message
    const allContents = [...conversationContents.slice(0, -1), currentMessage]; // Remove the last user message from history since we're adding the current one
    
    console.log('Sending conversation with', allContents.length, 'messages');
    
    const requestBody = {
      contents: allContents,
      generationConfig: {
        temperature: 0.7,
        topK: 32,
        topP: 1,
        maxOutputTokens: 512,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK'}
      ] }  ;

    console.log('Gemini API response status:', geminiRes.status);

    let data;
    try {
      const responseText = await geminiRes.text();
      console.log('Raw Gemini response:', responseText);
      
      if (!responseText.trim()) {
        return res.status(502).json({ error: 'Empty response from Gemini API' });
      }
      
      data = JSON.parse(responseText);
    } catch (jsonErr) {
      console.error('JSON parsing error:', jsonErr);
      return res.status(502).json({ error: 'Invalid JSON from Gemini API', details: String(jsonErr) });
    }

    if (!geminiRes.ok) {
      console.error('Gemini API error:', data);
      return res.status(geminiRes.status).json({ error: 'Gemini API error', details: data });
    }

    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (candidate) {
      console.log('Successful response from Gemini');
      
      // Extract movie titles and fetch posters
      const movieTitles = extractMovieTitles(candidate);
      console.log('Extracted movie titles:', movieTitles);
      
      const movieData = [];
      for (const title of movieTitles) {
        const movieInfo = await getMoviePoster(title);
        if (movieInfo) {
          movieData.push(movieInfo);
        }
      }
      
      return res.json({ 
        response: candidate.trim(),
        movies: movieData // Include movie data with posters
      });
    } else {
      console.error('Unexpected response structure:', data);
      return res.status(502).json({ error: 'Unexpected response structure from Gemini', details: data });
    }
    
  } catch (err) {
    console.error('Error contacting Gemini API:', err);
    return res.status(500).json({ error: 'Failed to contact Gemini API', details: String(err) });
  }
});

module.exports = router;