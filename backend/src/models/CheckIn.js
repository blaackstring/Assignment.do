const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    maxlength: 200,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent multiple check-ins for the same habit on the same day
checkInSchema.index({ habitId: 1, date: 1 }, { unique: true });

// Index for efficient querying by user and date
checkInSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('CheckIn', checkInSchema);

