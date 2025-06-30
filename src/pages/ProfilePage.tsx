import React, { useRef, useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useContentStore } from '../store/contentStore';
import Button from '../components/ui/Button';
import ContentGrid from '../components/ui/ContentGrid';
import { Link } from 'react-router-dom';
import { Content } from '../types';
import { uploadProfilePicture, getUserLikedContent } from '@/services/api';
import { Bookmark, Heart } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, logout, updateProfilePicture, token } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [favoriteContents, setFavoriteContents] = useState<Content[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user's liked content
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingFavorites(true);
        const likedContent = await getUserLikedContent(user.id);
        setFavoriteContents(likedContent);
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setLoadingFavorites(false);
      }
    };

    loadFavorites();
  }, [user?.id]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await uploadProfilePicture(file, token || undefined);
      updateProfilePicture(result.profilePictureUrl);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          User not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Please log in to view your profile.
        </p>
        <Link to="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative group">
              <div 
                className="w-32 h-32 rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-bold cursor-pointer overflow-hidden transition-all duration-200 group-hover:opacity-80"
                onClick={handleAvatarClick}
                tabIndex={0}
                role="button"
                aria-label="Change profile picture"
                title="Change profile picture"
              >
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`} 
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white">{user.name.charAt(0)}</span>
                )}
              </div>
              
              {/* Upload overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-white">Change Photo</span>
                </div>
              </div>

              {/* Loading indicator */}
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Upload profile picture"
                title="Upload profile picture"
              />
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2 text-white">{user.name}</h1>
              <p className="text-indigo-200 mb-4">{user.email}</p>
              <p className="text-indigo-200 mb-4">
                Member since: {new Date(user.createdAt).toLocaleDateString()}
              </p>
              
              {/* Upload error message */}
              {uploadError && (
                <p className="text-red-300 mb-4 text-sm">{uploadError}</p>
              )}
              
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-indigo-700"
                onClick={logout}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Favorites Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Heart className="text-red-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Your Favorites
              </h2>
            </div>
            <Link to="/watchlist">
              <Button variant="outline" className="flex items-center gap-2">
                <Bookmark size={16} />
                View Watchlist
              </Button>
            </Link>
          </div>
          
          {loadingFavorites ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : favoriteContents.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-md">
              <Heart className="text-gray-400 dark:text-gray-600 mx-auto mb-4" size={64} />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You haven't liked any content yet.
              </p>
              <Link to="/browse">
                <Button>Browse Content</Button>
              </Link>
            </div>
          ) : (
            <ContentGrid contents={favoriteContents} />
          )}
        </div>
      </section>
      
      {/* Account Settings */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Account Settings
          </h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Personal Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={user.name}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      disabled
                      aria-label="Full name"
                      title="Full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      disabled
                      aria-label="Email address"
                      title="Email address"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button variant="outline">Edit Profile</Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Security Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value="********"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      disabled
                      aria-label="Password"
                      title="Password"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button variant="outline">Change Password</Button>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Privacy Settings
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">Email Notifications</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive emails about new recommendations and updates
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      value="" 
                      className="sr-only peer" 
                      defaultChecked 
                      aria-label="Email notifications"
                      title="Email notifications"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">Public Profile</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Allow others to see your profile and reviews
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      value="" 
                      className="sr-only peer" 
                      aria-label="Public profile"
                      title="Public profile"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="mt-6">
                <Button variant="outline">Save Settings</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;