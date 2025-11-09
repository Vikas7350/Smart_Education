const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true
  },
  explanation: {
    type: String
  },
  points: {
    type: Number,
    default: 10
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  questions: [questionSchema],
  timeLimit: {
    type: Number, // in seconds, 0 means no limit
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isDailyChallenge: {
    type: Boolean,
    default: false
  },
  challengeDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total points before saving
quizSchema.pre('save', function(next) {
  if (this.questions && this.questions.length > 0) {
    this.totalPoints = this.questions.reduce((sum, q) => sum + (q.points || 10), 0);
  }
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);



