const mongoose = require('mongoose');
const { type } = require('os');

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  category: {
    type: String,
    enum: ['health', 'fitness', 'learning', 'productivity', 'mindfulness', 'social', 'other'],
    default: 'other'
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily'
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
   // Reminder settings
   reminder: { type: Boolean, default: true },
   reminderTime: { type: String }, // store as "21:00" (HH:mm)
   reminderSent: { type: Boolean, default: false }, // avoid duplicate mails
   isCompletedToday:{type:Boolean,default:false}
});

// Compound index to prevent duplicate habit names per user
habitSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Habit', habitSchema);

