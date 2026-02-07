const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  chapterTitle: {
    type: String,
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    index: true
  },
  chapterNumber: {
    type: Number,
    required: true
  },
  chapterContent: {
    type: String,
    default: ''
  },
  contentHTML: {
    type: String,
    default: ''
  },
  // Keep 'title' and 'content' for backward compatibility
  title: {
    type: String
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  content: {
    type: String
  },
  summary: {
    type: String
  },
  images: [{
    type: String
  }],
  tables: [{
    title: String,
    data: mongoose.Schema.Types.Mixed
  }],
  keywords: [{
    type: String
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  estimatedTime: {
    type: Number,
    default: 30
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Chapter', chapterSchema);

