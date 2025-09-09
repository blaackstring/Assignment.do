import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL 



// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// Habits API
export const habitsAPI = {
  getHabits: () => api.get('/habits'),
  createHabit: (habitData) => api.post('/habits', habitData),
  updateHabit: (id, habitData) => api.put(`/habits/${id}`, habitData),
  deleteHabit: (id) => api.delete(`/habits/${id}`),
};

// Check-ins API
export const checkInsAPI = {
  createCheckIn: (habitId, checkInData) => api.post(`/checkins/${habitId}`, checkInData),
  getCheckIns: (params) => api.get('/checkins', { params }),
  getHabitCheckIns: (habitId, params) => api.get(`/checkins/habit/${habitId}`, { params }),
  updateCheckIn: (checkInId, checkInData) => api.put(`/checkins/${checkInId}`, checkInData),
  deleteCheckIn: (checkInId) => api.delete(`/checkins/${checkInId}`),
};

// Social API
export const socialAPI = {
  searchUsers: (query, limit) => api.get('/social/search', { params: { q: query, limit } }),
  followUser: (userId) => api.post(`/social/follow/${userId}`),
  unfollowUser: (userId) => api.delete(`/social/follow/${userId}`),
  getFollowing: () => api.get('/social/following'),
  getFollowers: () => api.get('/social/followers'),
  getActivityFeed: (params) => api.get('/social/activity', { params }),
  getUserProfile: (userId) => api.get(`/social/profile/${userId}`),
};


export const VerfyUser={
  sendOtp:(userId)=>{
    console.log(userId);
    
    return api.post('/verify/sendOtp',{userId})

  },
  isVerified:(userId)=>{
    return api.get(`/verify/isVerified/${userId}`)

  },
  VerifyOtp:(userId,otp)=>{
    console.log(userId,otp);
    
    return api.post('/verify/otp',{userId,otp})
  }
}
export default api;

