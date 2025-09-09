const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/database');

// Import routes
const authRoutes = require('./src/routes/auth');
const habitRoutes = require('./src/routes/habits');
const checkInRoutes = require('./src/routes/checkins');
const socialRoutes = require('./src/routes/social');
const { task } = require('./src/routes/Remainder.js');
const {  default: routeVerify } = require('./src/routes/VerifyMail.js');

// Load environment variables
dotenv.config({path:'.env'});

// Connect to database
connectDB();
task

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/checkins', checkInRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/verify',routeVerify)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Habit Tracker API is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format'
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({
      message: 'Duplicate entry',
      field: Object.keys(err.keyPattern)[0]
    });
  }
  
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
