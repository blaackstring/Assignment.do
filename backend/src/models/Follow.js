const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  followingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate follows and self-following
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// Add validation to prevent self-following
followSchema.pre('save', function(next) {
  if (this.followerId.toString() === this.followingId.toString()) {
    const error = new Error('Cannot follow yourself');
    error.statusCode = 400;
    return next(error);
  }
  next();
});

module.exports = mongoose.model('Follow', followSchema);

