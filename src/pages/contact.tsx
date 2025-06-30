import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Users, MessageCircle, Twitter, Facebook, Instagram } from 'lucide-react';

const ContactPage: React.FC = () => {
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
          className="mb-8 flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-100 font-medium transition-colors"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back
        </button>
        <h1 className="text-3xl font-bold mb-6 text-indigo-700 dark:text-indigo-300 text-center">Contact Us</h1>
        <p className="mb-8 text-center text-lg text-gray-700 dark:text-gray-200">We're here to help and would love to hear from you! Whether you have a question, feedback, or just want to say hello, reach out to the Media Verse team using any of the methods below.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* General Inquiries */}
          <div className="bg-white/90 dark:bg-gray-900/80 rounded-lg shadow p-6 flex flex-col items-center">
            <Mail size={32} className="text-indigo-500 mb-2" />
            <h2 className="text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-300">General Inquiries</h2>
            <p className="text-gray-700 dark:text-gray-300 text-center mb-2">For questions about our recommendations, features, or partnership opportunities, email us at:</p>
            <a href="mailto:tarushnigam719@gmail.com" className="text-indigo-600 hover:underline font-medium">tarushnigam719@gmail.com</a>
          </div>
          {/* Support & Feedback */}
          <div className="bg-white/90 dark:bg-gray-900/80 rounded-lg shadow p-6 flex flex-col items-center">
            <MessageCircle size={32} className="text-pink-500 mb-2" />
            <h2 className="text-lg font-semibold mb-2 text-pink-700 dark:text-pink-300">Support & Feedback</h2>
            <p className="text-gray-700 dark:text-gray-300 text-center mb-2">If you encounter an issue or have suggestions on how we can improve, please let us know:</p>
            <a href="mailto:support@mediaverse.com" className="text-pink-600 hover:underline font-medium">support@mediaverse.com</a>
            <p className="text-xs text-gray-500 mt-2">Response Time: We aim to reply within 24–48 hours on business days.</p>
          </div>
        </div>
        {/* Social Media */}
        <div className="bg-white/90 dark:bg-gray-900/80 rounded-lg shadow p-6 flex flex-col items-center mb-4">
          <Users size={32} className="text-indigo-500 mb-2" />
          <h2 className="text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-300">Connect on Social</h2>
          <p className="text-gray-700 dark:text-gray-300 text-center mb-4">Stay up to date with the latest features and announcements, and share your favorite finds:</p>
          <div className="flex gap-6">
            <a href="https://twitter.com/MediaVerseHQ" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group">
              <Twitter size={28} className="text-blue-400 group-hover:text-blue-600 transition-colors" />
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">@MediaVerseHQ</span>
            </a>
            <a href="https://facebook.com/MediaVerseOfficial" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group">
              <Facebook size={28} className="text-blue-600 group-hover:text-blue-800 transition-colors" />
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">/MediaVerseOfficial</span>
            </a>
            <a href="https://instagram.com/Media_Verse" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group">
              <Instagram size={28} className="text-pink-500 group-hover:text-pink-700 transition-colors" />
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">@Media_Verse</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 