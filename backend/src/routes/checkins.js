const express = require('express');
const { body, validationResult } = require('express-validator');
const CheckIn = require('../models/CheckIn');
const Habit = require('../models/Habit');
const authenticateToken = require('../middleware/auth');



const router = express.Router();

// Check in for a habit
router.post('/:habitId', authenticateToken, [
  body('completed').isBoolean().withMessage('Completed must be a boolean'),
  body('notes').optional().isLength({ max: 200 }).withMessage('Notes must be less than 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { habitId } = req.params;
    const { completed = true, notes } = req.body;

    // Verify habit belongs to user
    const habit = await Habit.findOne({ 
      _id: habitId, 
      userId: req.user._id,
      isActive: true 
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if already checked in today
    const existingCheckIn = await CheckIn.findOne({
      habitId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (existingCheckIn) {
      return res.status(400).json({ 
        message: 'Already checked in for this habit today' 
      });
    }

    // Create check-in
    const checkIn = new CheckIn({
      habitId,
      userId: req.user._id,
      date: today,
      completed,
      notes: notes?.trim()
    });

      const Hbit=await Habit.findOneAndUpdate({habitId},
     { $set:{isCompletedToday:true}},
      { new: true }           // return updated document
      )
    await checkIn.save();

    res.status(201).json({
      message: 'Check-in recorded successfully',
      checkIn
    });
  } catch (error) {
    console.error('Error creating check-in:', error);
    res.status(500).json({ message: 'Server error creating check-in' });
  }
});

// Get check-ins for a specific habit
router.get('/habit/:habitId', authenticateToken, async (req, res) => {
  try {
    const { habitId } = req.params;
    const { limit = 30, page = 1 } = req.query;

    // Verify habit belongs to user
    const habit = await Habit.findOne({ 
      _id: habitId, 
      userId: req.user._id,
      isActive: true 
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const skip = (page - 1) * limit;
    const checkIns = await CheckIn.find({ habitId })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await CheckIn.countDocuments({ habitId });

    res.json({
      checkIns,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: checkIns.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    res.status(500).json({ message: 'Server error fetching check-ins' });
  }
});

// Get all check-ins for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, page = 1, habitId } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user._id };
    if (habitId) {
      query.habitId = habitId;
    }

    const checkIns = await CheckIn.find(query)
      .populate('habitId', 'name category frequency')
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await CheckIn.countDocuments(query);

    res.json({
      checkIns,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: checkIns.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    res.status(500).json({ message: 'Server error fetching check-ins' });
  }
});

// Update a check-in
router.put('/:checkInId', authenticateToken, [
  body('completed').optional().isBoolean().withMessage('Completed must be a boolean'),
  body('notes').optional().isLength({ max: 200 }).withMessage('Notes must be less than 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { checkInId } = req.params;
    const updates = req.body;

    const checkIn = await CheckIn.findOne({ 
      _id: checkInId, 
      userId: req.user._id 
    });

    if (!checkIn) {
      return res.status(404).json({ message: 'Check-in not found' });
    }

    Object.assign(checkIn, updates);
    await checkIn.save();

    res.json({
      message: 'Check-in updated successfully',
      checkIn
    });
  } catch (error) {
    console.error('Error updating check-in:', error);
    res.status(500).json({ message: 'Server error updating check-in' });
  }
});

// Delete a check-in
router.delete('/:checkInId', authenticateToken, async (req, res) => {
  try {
    const { checkInId } = req.params;

    const checkIn = await CheckIn.findOne({ 
      _id: checkInId, 
      userId: req.user._id 
    });

    if (!checkIn) {
      return res.status(404).json({ message: 'Check-in not found' });
    }

    await CheckIn.findByIdAndDelete(checkInId);

    res.json({ message: 'Check-in deleted successfully' });
  } catch (error) {
    console.error('Error deleting check-in:', error);
    res.status(500).json({ message: 'Server error deleting check-in' });
  }
});

module.exports = router;

