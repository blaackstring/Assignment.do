const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Follow = require('../models/Follow');
const CheckIn = require('../models/CheckIn');
const Habit = require('../models/Habit');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Search users
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude current user
        {
          $or: [
            { username: { $regex: q.trim(), $options: 'i' } },
            { email: { $regex: q.trim(), $options: 'i' } }
          ]
        }
      ]
    })
    .select('username email')
    .limit(parseInt(limit));

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error searching users' });
  }
});

// Follow a user
router.post('/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if trying to follow self
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if user exists
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      followerId: req.user._id,
      followingId: userId
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Create follow relationship
    const follow = new Follow({
      followerId: req.user._id,
      followingId: userId
    });

    await follow.save();

    // Add to user's friends list
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { friends: userId }
    });

    res.status(201).json({ message: 'Successfully followed user' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Server error following user' });
  }
});

// Unfollow a user
router.delete('/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Remove follow relationship
    const follow = await Follow.findOneAndDelete({
      followerId: req.user._id,
      followingId: userId
    });

    if (!follow) {
      return res.status(404).json({ message: 'Not following this user' });
    }

    // Remove from user's friends list
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { friends: userId }
    });

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Server error unfollowing user' });
  }
});

// Get following list
router.get('/following', authenticateToken, async (req, res) => {
  try {
    const following = await Follow.find({ followerId: req.user._id })
      .populate('followingId', 'username email')
      .sort({ createdAt: -1 });

    res.json(following.map(f => f.followingId));
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ message: 'Server error fetching following' });
  }
});

// Get followers list
router.get('/followers', authenticateToken, async (req, res) => {
  try {
    const followers = await Follow.find({ followingId: req.user._id })
      .populate('followerId', 'username email')
      .sort({ createdAt: -1 });

    res.json(followers.map(f => f.followerId));
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ message: 'Server error fetching followers' });
  }
});

// Get friends activity feed
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    // Get user's friends
    const user = await User.findById(req.user._id).populate('friends');
    const friendIds = user.friends.map(friend => friend._id);

    if (friendIds.length === 0) {
      return res.json({
        activities: [],
        pagination: {
          current: parseInt(page),
          total: 0,
          count: 0,
          totalCount: 0
        }
      });
    }

    // Get recent check-ins from friends
    const checkIns = await CheckIn.find({
      userId: { $in: friendIds },
      completed: true
    })
    .populate('userId', 'username')
    .populate('habitId', 'name category')
    .sort({ date: -1 })
    .limit(parseInt(limit))
    .skip(skip);

    // Get streaks for friends' habits
    const activities = await Promise.all(
      checkIns.map(async (checkIn) => {
        const streak = await calculateStreak(checkIn.habitId._id);
        return {
          ...checkIn.toObject(),
          streak
        };
      })
    );

    const total = await CheckIn.countDocuments({
      userId: { $in: friendIds },
      completed: true
    });

    res.json({
      activities,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: activities.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    res.status(500).json({ message: 'Server error fetching activity feed' });
  }
});

// Get user profile with stats
router.get('/profile/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('username email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's habits
    const habits = await Habit.find({ 
      userId, 
      isActive: true 
    });

    // Get total check-ins
    const totalCheckIns = await CheckIn.countDocuments({
      userId,
      completed: true
    });

    // Get longest streak
    let longestStreak = 0;
    for (const habit of habits) {
      const streak = await calculateStreak(habit._id);
      if (streak > longestStreak) {
        longestStreak = streak;
      }
    }

    // Check if current user is following this user
    const isFollowing = await Follow.findOne({
      followerId: req.user._id,
      followingId: userId
    });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      stats: {
        totalHabits: habits.length,
        totalCheckIns,
        longestStreak
      },
      isFollowing: !!isFollowing
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

// Helper function to calculate streak (same as in habits.js)
async function calculateStreak(habitId) {
  try {
    const checkIns = await CheckIn.find({ 
      habitId, 
      completed: true 
    }).sort({ date: -1 });

    if (checkIns.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's a check-in today
    const hasCheckInToday = checkIns.some(checkIn => {
      const checkInDate = new Date(checkIn.date);
      checkInDate.setHours(0, 0, 0, 0);
      return checkInDate.getTime() === today.getTime();
    });

    if (!hasCheckInToday) {
      // If no check-in today, check if yesterday had a check-in
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const hasCheckInYesterday = checkIns.some(checkIn => {
        const checkInDate = new Date(checkIn.date);
        checkInDate.setHours(0, 0, 0, 0);
        return checkInDate.getTime() === yesterday.getTime();
      });

      if (!hasCheckInYesterday) {
        return 0; // Streak broken
      }
    }

    // Calculate consecutive days
    let currentDate = new Date(today);
    if (!hasCheckInToday) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    for (const checkIn of checkIns) {
      const checkInDate = new Date(checkIn.date);
      checkInDate.setHours(0, 0, 0, 0);
      
      if (checkInDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (checkInDate.getTime() < currentDate.getTime()) {
        break; // Gap found, streak broken
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}

module.exports = router;

