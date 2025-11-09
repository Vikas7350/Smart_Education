const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  class: {
    type: String,
    required: true,
    enum: ['10']
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  points: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date
  },
  badges: [{
    type: String
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);



