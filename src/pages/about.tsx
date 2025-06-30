import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen py-12 relative overflow-hidden">
      {/* Gradient blurred background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          filter: 'blur(32px)',
          opacity: 0.6,
        }}
        aria-hidden="true"
      />
      <div className="container mx-auto px-4 max-w-3xl relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg p-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-100 font-medium transition-colors"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back
        </button>
        <h1 className="text-3xl font-bold mb-6 text-indigo-700 dark:text-indigo-300">About Media Verse</h1>
        <p className="mb-4">Welcome to <span className="font-semibold">Media Verse</span>—your humble companion on a personalized journey through the worlds of cinema, literature, music, podcasts, and articles. We understand that every taste is unique, and our mission is to connect you with stories and sounds that speak directly to your interests and curiosities.</p>

        <h2 className="text-xl font-semibold mt-8 mb-2">Our Commitment</h2>
        <p className="mb-4">We believe that discovering new media should be effortless and rewarding. Our sophisticated recommendation algorithm learns from your preferences and viewing history to surface both hidden gems and beloved classics. Whether you're seeking a thought‑provoking novel, an immersive soundtrack, or a captivating documentary, Media Verse is here to guide you with care and insight.</p>

        <h2 className="text-xl font-semibold mt-8 mb-2">Intelligent Assistance</h2>
        <p className="mb-4">Need a tailored suggestion? Our integrated AI Chatboard is always ready to help. Simply ask a question—<span className="italic">"Recommend award‑winning science fiction books by women authors,"</span> or <span className="italic">"What podcasts explore the intersection of art and technology?"</span>—and receive thoughtful, personalized answers in an instant.</p>

        <h2 className="text-xl font-semibold mt-8 mb-2">Comprehensive Media Hub</h2>
        <ul className="list-disc ml-6 mb-4">
          <li><span className="font-semibold">In‑Depth Details:</span> Explore trailers, cast and author biographies, and rich metadata—all in one place.</li>
          <li><span className="font-semibold">Global Reviews:</span> Share your thoughts or read reviews from users around the world.</li>
          <li><span className="font-semibold">Curated Lists:</span> Create watchlists and shortlists organized by genre, creator, or mood, and revisit them whenever you like.</li>
          <li><span className="font-semibold">Seamless Playback:</span> Watch official trailers and sample tracks directly on our site via embedded links.</li>
        </ul>

        <p className="mt-8">Thank you for choosing Media Verse. We're honored to accompany you as you discover, enjoy, and share the stories that move you.</p>
      </div>
    </div>
  );
};

export default AboutPage; 