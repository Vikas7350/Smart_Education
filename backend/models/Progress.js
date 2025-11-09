const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  quizAttempts: [{
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    },
    score: Number,
    totalQuestions: Number,
    correctAnswers: Number,
    timeTaken: Number, // in seconds
    attemptedAt: {
      type: Date,
      default: Date.now
    }
  }],
  bestScore: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
progressSchema.index({ user: 1, chapter: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);



