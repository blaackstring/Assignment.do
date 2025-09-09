import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'
import { socialAPI } from '../services/api';
import { Search, UserPlus, UserMinus, Users, Activity, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const SocialPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'following') {
      fetchFollowing();
    } else if (activeTab === 'followers') {
      fetchFollowers();
    }
  }, [activeTab]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await socialAPI.searchUsers(searchQuery);
      setSearchResults(response.data);
    } catch (error) {
      toast.error('Failed to search users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await socialAPI.getFollowing();
      setFollowing(response.data);
    } catch (error) {
      toast.error('Failed to fetch following');
    }
  };

  const fetchFollowers = async () => {
    try {
      const response = await socialAPI.getFollowers();
      setFollowers(response.data);
    } catch (error) {
      toast.error('Failed to fetch followers');
    }
  };

  const handleFollow = async (userId) => {
    try {
      await socialAPI.followUser(userId);
      toast.success('Successfully followed user');
      fetchFollowing();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to follow user';
      toast.error(message);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await socialAPI.unfollowUser(userId);
      toast.success('Successfully unfollowed user');
      fetchFollowing();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to unfollow user';
      toast.error(message);
    }
  };

  const tabs = [
    { id: 'search', label: 'Search Users', icon: Search },
    { id: 'following', label: 'Following', icon: UserPlus },
    { id: 'followers', label: 'Followers', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-black/70 to-black">
      {/* Header */}
      <header className="text-white shadow-sm ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 text-gray-300 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/activity"
                className="flex items-center space-x-2 text-gray-300 hover:text-gray-600 transition-colors"
              >
                <Activity className="h-5 w-5" />
                <span>Activity</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-300 mb-2">Social</h1>
          <p className=" text-gray-300 ">
            Connect with friends and stay motivated together.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-200 hover:text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div>
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by username or email..."
                    className="w-full px-4 placeholder:text-white py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {searchResults.map((user) => (
                <div key={user._id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.username}
                        </h3>
                        <p className="text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFollow(user._id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Follow</span>
                    </button>
                  </div>
                </div>
              ))}

              {searchResults.length === 0 && searchQuery && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  No users found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        )}

        {/* Following Tab */}
        {activeTab === 'following' && (
          <div className="space-y-4">
            {following.map((user) => (
              <div key={user._id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.username}
                      </h3>
                      <p className="text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnfollow(user._id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <UserMinus className="h-4 w-4" />
                    <span>Unfollow</span>
                  </button>
                </div>
              </div>
            ))}

            {following.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                You're not following anyone yet. Search for users to follow!
              </div>
            )}
          </div>
        )}

        {/* Followers Tab */}
        {activeTab === 'followers' && (
          <div className="space-y-4">
            {followers.map((user) => (
              <div key={user._id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user.username}
                    </h3>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>
              </div>
            ))}

            {followers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No followers yet. Share your progress to get followers!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialPage;
