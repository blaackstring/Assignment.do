const express = require('express');
const { body, validationResult } = require('express-validator');
const Habit = require('../models/Habit');
const CheckIn = require('../models/CheckIn');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get all habits for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const habits = await Habit.find({ 
      userId: req.user._id, 
      isActive: true 
    }).sort({ createdAt: -1 });

    // Get check-ins for today for each habit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const habitsWithCheckIns = await Promise.all(
      habits.map(async (habit) => {
        const todayCheckIn = await CheckIn.findOne({
          habitId: habit._id,
          date: { $gte: today, $lt: tomorrow }
        });

        // Calculate streak
        const streak = await calculateStreak(habit._id);

        return {
          ...habit.toObject(),
          checkedInToday: !!todayCheckIn,
          streak
        };
      })
    );

    res.json(habitsWithCheckIns);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ message: 'Server error fetching habits' });
  }
});

// Create a new habit
router.post('/', authenticateToken, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Habit name must be between 1 and 100 characters'),
  body('category')
    .optional()
    .isIn(['health', 'fitness', 'learning', 'productivity', 'mindfulness', 'social', 'other'])
    .withMessage('Invalid category'),
  body('frequency')
    .optional()
    .isIn(['daily', 'weekly'])
    .withMessage('Frequency must be daily or weekly')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, category, frequency, description,reminder } = req.body;

    // Check for duplicate habit name for this user
    const existingHabit = await Habit.findOne({
      userId: req.user._id,
      name: name.trim(),
      isActive: true
    });

    if (existingHabit) {
      return res.status(400).json({ 
        message: 'You already have a habit with this name' 
      });
    }
console.log(reminder);

    const habit = new Habit({
      userId: req.user._id,
      name: name.trim(),
      category: category || 'other',
      frequency: frequency || 'daily',
      description: description?.trim(),
      reminderTime:reminder
    });

    await habit.save();

    res.status(201).json({
      message: 'Habit created successfully',
      habit: {
        ...habit.toObject(),
        checkedInToday: false,
        streak: 0
      }
    });
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ message: 'Server error creating habit' });
  }
});

// Update a habit
router.put('/:id', authenticateToken, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Habit name must be between 1 and 100 characters'),
  body('category')
    .optional()
    .isIn(['health', 'fitness', 'learning', 'productivity', 'mindfulness', 'social', 'other'])
    .withMessage('Invalid category'),
  body('frequency')
    .optional()
    .isIn(['daily', 'weekly'])
    .withMessage('Frequency must be daily or weekly')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const updates = req.body;

  
    

    const habit = await Habit.findOne({ 
      _id: id, 
      userId: req.user._id,
      isActive: true 
    });

    
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Check for duplicate name if name is being updated
    if (updates.name && updates.name.trim() !== habit.name) {
      const existingHabit = await Habit.findOne({
        userId: req.user._id,
        name: updates.name.trim(),
        isActive: true,
        _id: { $ne: id }
      });

      if (existingHabit) {
        return res.status(400).json({ 
          message: 'You already have a habit with this name' 
        });
      }
    }

    Object.assign(habit, updates);
    await habit.save();

    res.json({
      message: 'Habit updated successfully',
      habit
    });
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ message: 'Server error updating habit' });
  }
});

// Delete a habit (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const habit = await Habit.findOne({ 
      _id: id, 
      userId: req.user._id,
      isActive: true 
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    habit.isActive = false;
    await habit.save();

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ message: 'Server error deleting habit' });
  }
});

// Helper function to calculate streak
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
