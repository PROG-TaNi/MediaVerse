import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GeminiLogoImg from '../../../Ai logo.png';
import { searchMovies, searchBooks, searchMusic, Content } from '@/services/api';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  className = '', 
  placeholder = 'Search movies, books, music...' 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Content[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGeminiSidebar, setShowGeminiSidebar] = useState(false);
  const [geminiMessages, setGeminiMessages] = useState<ChatMessage[]>([]);
  const [geminiInput, setGeminiInput] = useState('');
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiError, setGeminiError] = useState<string|null>(null);
  
  const searchTimeoutRef = useRef<number>();
  const resultsRef = useRef<HTMLDivElement>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('gemini_chat_history');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Only load messages from the last 24 hours to prevent infinite growth
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        const recentMessages = parsed.filter((msg: ChatMessage) => msg.timestamp > oneDayAgo);
        setGeminiMessages(recentMessages);
      } catch (err) {
        console.error('Error loading chat history:', err);
        localStorage.removeItem('gemini_chat_history');
      }
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (geminiMessages.length > 0) {
      localStorage.setItem('gemini_chat_history', JSON.stringify(geminiMessages));
    }
  }, [geminiMessages]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search function
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }
    try {
      setIsSearching(true);
      setError(null);
      const [movies, books, music] = await Promise.all([
        searchMovies(searchQuery, 1, 5).catch(() => []),
        searchBooks(searchQuery, 1, 5).catch(() => []),
        searchMusic(searchQuery, 1, 5).catch(() => [])
      ]);
      const allResults = [...movies, ...books, ...music].slice(0, 10);
      setResults(allResults);
    } catch (err) {
      setError('Search failed. Please try again.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      setResults([]);
      setError(null);
    }
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(value.length > 0);
  };

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setError(null);
    setShowResults(false);
  };

  const handleResultClick = (content: Content) => {
    navigate(`/content/${content.id}?type=${content.type}`);
    setShowResults(false);
    setQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
    }
  };

  // Clear chat history function
  const clearChatHistory = () => {
    setGeminiMessages([]);
    localStorage.removeItem('gemini_chat_history');
  };

  // Gemini chat logic with conversation history
  const handleGeminiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = geminiInput.trim();
    if (!prompt) return;

    const userMessage: ChatMessage = { 
      role: 'user', 
      text: prompt, 
      timestamp: Date.now() 
    };
    
    setGeminiMessages(msgs => [...msgs, userMessage]);
    setGeminiInput('');
    setGeminiLoading(true);
    setGeminiError(null);

    try {
      // Send conversation history along with the current prompt
      const conversationHistory = [...geminiMessages, userMessage];
      
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          conversationHistory: conversationHistory.slice(-10) // Send last 10 messages for context
        })
      });

      let data: any = null;
      let text: string | null = null;

      try {
        text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch (jsonErr) {
        setGeminiError('Invalid JSON response from server');
        return;
      }

      if (!res.ok) {
        setGeminiError((data && (data.error || JSON.stringify(data))) || 'Failed to get response');
        return;
      }

      if (!data || typeof data.response !== 'string') {
        setGeminiError('Unexpected response from server');
        return;
      }

      const aiMessage: ChatMessage = {
        role: 'ai',
        text: data.response,
        timestamp: Date.now()
      };

      setGeminiMessages(msgs => [...msgs, aiMessage]);

      console.log('Prompt:', prompt);
      console.log('Gemini API response:', data);
    } catch (err: any) {
      setGeminiError(err.message || 'Failed to get response');
    } finally {
      setGeminiLoading(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setGeminiInput(prompt);
    // Trigger form submission
    setTimeout(() => {
      const form = document.querySelector('form[data-gemini-form]') as HTMLFormElement;
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 0);
  };

  // Helper to render bold for **text**
  function renderWithBold(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  }

  // Helper to render bold and image for **text**
  function renderWithBoldAndImage(text: string) {
    // Extract [Poster: URL]
    const posterMatch = text.match(/\[Poster:\s*(https?:\/\/[^\]\s]+)\]/i);
    let posterUrl = null;
    if (posterMatch) {
      posterUrl = posterMatch[1];
      text = text.replace(posterMatch[0], ''); // Remove the poster tag from text
    }

    // Bold formatting
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, idx) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });

    return (
      <>
        {rendered}
        {posterUrl && (
          <div style={{ marginTop: 8 }}>
            <img src={posterUrl} alt="Movie Poster" style={{ maxWidth: 180, borderRadius: 8 }} />
          </div>
        )}
      </>
    );
  }

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [geminiMessages, geminiLoading]);

  return (
    <div className={`relative ${className}`} ref={resultsRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowResults(query.length > 0)}
            placeholder={placeholder}
            className="w-full pl-10 pr-14 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
          {query && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search"
              className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          )}
          {/* Gemini AI logo button */}
          <button
            type="button"
            aria-label="Open Gemini AI Chat"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-white dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-gray-200 dark:border-gray-700 shadow"
            onClick={() => setShowGeminiSidebar(true)}
          >
            <img src={GeminiLogoImg} alt="Gemini AI Logo" className="w-6 h-6" />
          </button>
        </div>
      </form>
      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isSearching && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="animate-spin mr-2" size={20} />
              <span className="text-gray-600 dark:text-gray-400">Searching...</span>
            </div>
          )}
          {error && (
            <div className="p-4 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          {!isSearching && !error && results.length === 0 && query.trim() && (
            <div className="p-4 text-gray-600 dark:text-gray-400 text-sm text-center">
              No results found for "{query}"
            </div>
          )}
          {!isSearching && !error && (
            <div className="py-2">
              {/* Content Results */}
              {results.map((content) => (
                <button
                  key={content.id}
                  onClick={() => handleResultClick(content)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3"
                >
                  <div className="flex-shrink-0 w-12 h-16 rounded overflow-hidden">
                    <img
                      src={content.coverImageUrl || 'https://via.placeholder.com/48x64?text=No+Image'}
                      alt={content.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x64?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {content.title}
                      </span>
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 capitalize">
                        {content.type}
                      </span>
                    </div>
                    {content.authors && content.authors.length > 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        by {content.authors.slice(0, 2).join(', ')}
                      </p>
                    )}
                    {content.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                        {content.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
              {query.trim() && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      navigate(`/search?q=${encodeURIComponent(query)}`);
                      setShowResults(false);
                    }}
                    className="w-full px-4 py-3 text-left text-indigo-600 dark:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    View all results for "{query}"
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* Gemini AI Sidebar */}
      {showGeminiSidebar && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity duration-300" 
            onClick={() => setShowGeminiSidebar(false)} 
          />
          {/* Sidebar */}
          <div className="relative w-full max-w-md h-screen bg-gradient-to-b from-gray-900 to-indigo-900 shadow-2xl border-l border-gray-700 flex flex-col slide-in-from-right">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-black/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-full">
                  <img src={GeminiLogoImg} alt="Movie Chat" className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-lg text-white">Movie Chat</span>
                  <div className="text-xs text-gray-300">Powered by Gemini AI</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {geminiMessages.length > 0 && (
                  <button
                    onClick={clearChatHistory}
                    className="p-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/10 text-xs"
                    aria-label="Clear chat history"
                    title="Clear chat history"
                  >
                    Clear
                  </button>
                )}
                <button 
                  onClick={() => setShowGeminiSidebar(false)} 
                  className="p-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/10" 
                  aria-label="Close Movie Chat"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            {/* Chat content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatContentRef}>
              {geminiMessages.length === 0 && (
                <div className="text-center text-gray-300 mt-8">
                  <div className="p-4 bg-indigo-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <img src={GeminiLogoImg} alt="Movie Chat" className="w-6 h-6" />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-white">Welcome to Movie Chat!</p>
                  <p className="text-sm mt-2 text-gray-300">Try asking me:</p>
                  <div className="mt-3 space-y-2 flex flex-col items-center">
                    <button 
                      onClick={() => handlePromptClick("Suggest a good romantic comedy movie")}
                      className="w-full max-w-xs text-sm bg-white/10 p-2 rounded-lg border border-white/20 hover:bg-white/20 transition-colors text-white"
                    >
                      "Suggest a good romantic comedy movie"
                    </button>
                    <button 
                      onClick={() => handlePromptClick("What are some must-watch classic films?")}
                      className="w-full max-w-xs text-sm bg-white/10 p-2 rounded-lg border border-white/20 hover:bg-white/20 transition-colors text-white"
                    >
                      "What are some must-watch classic films?"
                    </button>
                    <button 
                      onClick={() => handlePromptClick("Recommend me a movie based on Inception")}
                      className="w-full max-w-xs text-sm bg-white/10 p-2 rounded-lg border border-white/20 hover:bg-white/20 transition-colors text-white"
                    >
                      "Recommend me a movie based on Inception"
                    </button>
                  </div>
                </div>
              )}
              {/* Chat Messages */}
              {geminiMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-2xl px-4 py-3 max-w-xs lg:max-w-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'bg-indigo-500/50 text-white shadow-md border border-indigo-400/30'
                  }`}>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap text-white">
                      {msg.role === 'ai' ? renderWithBoldAndImage(msg.text) : msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {/* Loading State */}
              {geminiLoading && (
                <div className="flex justify-center items-center py-4">
                  <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-2xl border border-white/20">
                    <Loader2 className="animate-spin text-white" size={20} />
                    <span className="text-white text-sm">Thinking...</span>
                  </div>
                </div>
              )}
              {/* Error State */}
              {geminiError && (
                <div className="text-center py-4">
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-300 text-sm">{geminiError}</p>
                  </div>
                </div>
              )}
            </div>
            {/* Input box */}
            <div className="p-4 border-t border-gray-700 bg-black/20">
              <form onSubmit={handleGeminiSubmit} data-gemini-form className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about movies..."
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400 text-sm"
                  value={geminiInput}
                  onChange={e => setGeminiInput(e.target.value)}
                  disabled={geminiLoading}
                />
                <button
                  type="submit"
                  disabled={geminiLoading || !geminiInput.trim()}
                  className="px-4 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors duration-200 flex items-center justify-center"
                >
                  {geminiLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <ArrowRight size={18} />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;