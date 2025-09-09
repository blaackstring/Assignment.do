import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { habitsAPI, checkInsAPI, VerfyUser } from '../services/api';
import { Plus, Calendar, Target, TrendingUp, LogOut, Users, Activity, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import HabitCard from './habits/HabitCard';
import CreateHabitModal from './habits/CreateHabitModal';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isVerified,setIsVerified]=useState(false);

  useEffect(()=>{

   (async()=>{
     const res= await VerfyUser.isVerified(user.id)

     if(res.status){
      setIsVerified(true)
     }
     console.log(res)
   })()
    if(!user){
      navigate('/login')
    }
    

  },[user])

  useEffect(() => {
    fetchHabits();
  }, []);

  

  const fetchHabits = async () => {
    try {
      const response = await habitsAPI.getHabits();
      setHabits(response.data);
    } catch (error) {
      toast.error('Failed to fetch habits');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCheckIn = async (habitId) => {
    try {
      await checkInsAPI.createCheckIn(habitId, { completed: true });
      toast.success('Habit checked in successfully!');
      fetchHabits(); // Refresh habits to update streak
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to check in';
      toast.error(message);
    }
  };

  const handleCreateHabit = async (habitData) => {
    try {
      await habitsAPI.createHabit(habitData);
      console.log('i m here');
      
      toast.success('Habit created successfully!');
      setShowCreateModal(false);
      fetchHabits();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create habit';
      toast.error(message);
      console.log(message);
      
    }
  };

  const totalHabits = habits.length;
  const completedToday = habits.filter(habit => habit.checkedInToday).length;
  const totalStreak = habits.reduce((sum, habit) => sum + (habit.streak || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  bg-gradient-to-r from-black via-black/80  to-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-black/50  to-black  border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-300">Habit Tracker</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/activity"
                className="flex items-center space-x-2 text-gray-300 hover:text-gray-600 transition-colors"
              >
                <Activity className="h-5 w-5" />
                <span>Activity</span>
              </Link>
              <Link
                to="/social"
                className="flex items-center space-x-2 text-gray-300 hover:text-gray-600 transition-colors"
              >
                <Users className="h-5 w-5" />
                <span>Social</span>
              </Link>

                 {!isVerified&&(
              <Link
                to="/verify"
                className="flex items-center space-x-2 text-gray-300 hover:text-gray-600 transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span>Verify Email</span>
              </Link>)}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-300 hover:text-gray-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-5xl font-bold text-gray-300 mb-2">
            Welcome back,<span className='bg-gradient-to-r bg-clip-text text-transparent from-red-500 via-purple-500 to-sky-600/50 '> {user?.username}!</span>
          </h2>
          <p className="text-gray-300 font-bold">
            Keep building those positive habits, one day at a time.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Habits</p>
                <p className="text-2xl font-bold text-gray-900">{totalHabits}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">{completedToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Streak</p>
                <p className="text-2xl font-bold text-gray-900">{totalStreak}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Habits Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Your Habits</h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Habit</span>
            </button>
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-12 bg-white/30 rounded-lg shadow-sm">
              <Target className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No habits yet</h3>
              <p className="mt-2 text-gray-600">
                Start building better habits by creating your first one.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create your first habit
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {habits.map((habit) => (
                <HabitCard
                  setHabits={setHabits}
                  showCreateModal={showCreateModal}
                  setShowCreateModal={setShowCreateModal}
                  key={habit._id}
                  habit={habit}
                  onCheckIn={() => handleCheckIn(habit._id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Habit Modal */}
      {showCreateModal && (
        <CreateHabitModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateHabit}
        />
      )}
    </div>
  );
};

export default Dashboard;
