const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  icon: {
    type: String,
    default: '📚'
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  class: {
    type: String,
    required: true,
    enum: ['10']
  },
  chapters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subject', subjectSchema);

