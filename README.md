# 🚀 Full-Stack Habit Tracker App

A modern, feature-rich habit tracking application built with React, Node.js, Express, and MongoDB. Track your daily habits, build streaks, and stay motivated with social features.

## ✨ Features

### 🔐 Authentication
- User registration and login with JWT
- Protected routes and secure authentication
- Password hashing with bcrypt

### 📊 Habit Management
- Create, edit, and delete habits
- Daily and weekly habit tracking
- Prevent duplicate habit names per user
- Habit categories (Health, Fitness, Learning, etc.)
- One check-in per day/week restriction

### 🔥 Progress Tracking
- Real-time streak calculation
- Completion rate statistics
- Visual progress indicators
- Historical check-in data

### 👥 Social Features
- Search and follow other users
- Prevent self-following
- Friends activity feed
- See friends' streaks and recent check-ins
- Social accountability system

### 📱 Modern UI/UX
- Responsive design (mobile-first)
- Clean, modern interface with Tailwind CSS
- Toast notifications
- Loading states and error handling
- Intuitive navigation

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Beautiful icons
- **Date-fns** - Date utilities

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/habit-tracker
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

   The backend will be running on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   touch .env
   ```

4. **Add environment variables:**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be running on `http://localhost:5173`

## 📁 Project Structure

```
habit-tracker-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Habit.js
│   │   │   ├── CheckIn.js
│   │   │   └── Follow.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── habits.js
│   │   │   ├── checkins.js
│   │   │   └── social.js
│   │   └── utils/
│   │       └── jwt.js
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   │   ├── LoginForm.jsx
    │   │   │   └── RegisterForm.jsx
    │   │   ├── habits/
    │   │   │   ├── HabitCard.jsx
    │   │   │   └── CreateHabitModal.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── SocialPage.jsx
    │   │   ├── ActivityPage.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── contexts/
    │   │   └── AuthContext.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

## 🗄️ Database Schema

### User Model
```javascript
{
  username: String (unique),
  email: String (unique),
  passwordHash: String,
  friends: [ObjectId],
  createdAt: Date
}
```

### Habit Model
```javascript
{
  userId: ObjectId,
  name: String,
  category: String,
  frequency: String (daily/weekly),
  description: String,
  createdAt: Date,
  isActive: Boolean
}
```

### CheckIn Model
```javascript
{
  habitId: ObjectId,
  userId: ObjectId,
  date: Date,
  completed: Boolean,
  notes: String,
  createdAt: Date
}
```

### Follow Model
```javascript
{
  followerId: ObjectId,
  followingId: ObjectId,
  createdAt: Date
}
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Habits
- `GET /api/habits` - Get user's habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit

### Check-ins
- `POST /api/checkins/:habitId` - Check in for habit
- `GET /api/checkins` - Get user's check-ins
- `GET /api/checkins/habit/:habitId` - Get habit's check-ins
- `PUT /api/checkins/:checkInId` - Update check-in
- `DELETE /api/checkins/:checkInId` - Delete check-in

### Social
- `GET /api/social/search` - Search users
- `POST /api/social/follow/:userId` - Follow user
- `DELETE /api/social/follow/:userId` - Unfollow user
- `GET /api/social/following` - Get following list
- `GET /api/social/followers` - Get followers list
- `GET /api/social/activity` - Get activity feed
- `GET /api/social/profile/:userId` - Get user profile

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variable: `VITE_API_URL=https://your-backend-url.com/api`
3. Deploy

### Backend (Render/Railway/Heroku)
1. Connect your GitHub repository
2. Set environment variables:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - A secure random string
   - `FRONTEND_URL` - Your frontend URL
3. Deploy

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your backend environment

## 🎯 Key Features Explained

### Streak Calculation
The app calculates streaks by:
1. Checking if there's a check-in today
2. If not, checking if there was one yesterday
3. Counting consecutive days backwards
4. Stopping at the first gap

### Social Accountability
- Users can follow each other
- Activity feed shows friends' recent check-ins
- Streak information is shared
- Prevents self-following

### Edge Case Handling
- No duplicate habits per user
- No multiple check-ins on the same day/week
- Cannot follow yourself
- Form validation on both frontend and backend
- Proper error handling and user feedback

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by popular habit tracking apps
- Designed with user experience in mind
- Mobile-first responsive design

---

**Happy habit building! 🎉**

