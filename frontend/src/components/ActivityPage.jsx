import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'
import { socialAPI } from '../services/api';
import { Activity, Flame, Calendar, ArrowLeft, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const ActivityPage = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    count: 0,
    totalCount: 0,
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await socialAPI.getActivityFeed({ page, limit: 20 });
      setActivities(response.data.activities);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch activity feed');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      health: 'bg-red-100 text-red-800',
      fitness: 'bg-blue-100 text-blue-800',
      learning: 'bg-green-100 text-green-800',
      productivity: 'bg-yellow-100 text-yellow-800',
      mindfulness: 'bg-purple-100 text-purple-800',
      social: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.other;
  };

  const getFrequencyIcon = (frequency) => {
    return frequency === 'daily' ? Calendar : Calendar;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-black/80  to-black">
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
                to="/social"
                className="flex items-center space-x-2 text-gray-300 hover:text-gray-600 transition-colors"
              >
                <Users className="h-5 w-5 " />
                <span className=''>Social</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-300 hover:text-gray-600 mb-2">Activity Feed</h1>
          <p className="text-gray-300 hover:text-gray-600">
            See what your friends are up to and stay motivated together.
          </p>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-12 bg-white/40 rounded-lg shadow-sm">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No activity yet</h3>
            <p className="mt-2 text-gray-600">
              Follow some friends to see their habit progress here.
            </p>
            <Link
              to="/social"
              className="mt-4 inline-flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Find Friends</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {activities.map((activity) => {
              const FrequencyIcon = getFrequencyIcon(activity.habitId.frequency);
              return (
                <div key={activity._id} className="bg-white/80 rounded-lg shadow-sm p-6">
                  <div className="flex items-start space-x-4">
                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {activity.userId.username}
                        </span>
                        <span className="text-gray-500">completed</span>
                        <span className="font-medium text-gray-900">
                          {activity.habitId.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(activity.habitId.category)}`}>
                            {activity.habitId.category}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <FrequencyIcon className="h-3 w-3" />
                          <span>{activity.habitId.frequency}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Flame className="h-3 w-3 text-orange-500" />
                          <span>{activity.streak} day streak</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                        </p>
                        
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600 font-medium">Completed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.total > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => fetchActivities(pagination.current - 1)}
                disabled={pagination.current === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-gray-300 hover:text-gray-600">
                Page {pagination.current} of {pagination.total}
              </span>
              
              <button
                onClick={() => fetchActivities(pagination.current + 1)}
                disabled={pagination.current === pagination.total}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-300 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
