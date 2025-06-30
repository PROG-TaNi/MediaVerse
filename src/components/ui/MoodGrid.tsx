import React from 'react';
import { Smile, Zap, Heart, BookOpen, Music } from 'lucide-react';

const moods = [
  {
    name: 'Chill',
    icon: <Smile size={40} className="text-indigo-400" />,
    description: 'Relax and unwind with calm picks',
  },
  {
    name: 'Energetic',
    icon: <Zap size={40} className="text-indigo-400" />,
    description: 'Get pumped with high-energy content',
  },
  {
    name: 'Romantic',
    icon: <Heart size={40} className="text-indigo-400" />,
    description: 'Feel the love with romantic vibes',
  },
  {
    name: 'Focus',
    icon: <BookOpen size={40} className="text-indigo-400" />,
    description: 'Stay sharp with focused selections',
  },
  {
    name: 'Party',
    icon: <Music size={40} className="text-indigo-400" />,
    description: 'Turn up the fun with party hits',
  },
];

const MoodGrid: React.FC = () => (
  <section className="py-12 bg-gray-50 dark:bg-gray-900">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold mb-12 text-center text-gray-900 dark:text-white">
        Explore Mood
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {moods.map((mood) => (
          <div
            key={mood.name}
            className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md transition-all duration-300 flex flex-col items-center text-center transform hover:scale-105 hover:shadow-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/40 cursor-pointer"
          >
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
              {mood.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{mood.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{mood.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default MoodGrid; 