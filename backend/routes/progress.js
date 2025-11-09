const express = require('express');
const Progress = require('../models/Progress');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user progress
router.get('/', auth, async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user._id })
      .populate('chapter', 'title chapterNumber')
      .populate('subject', 'name')
      .sort({ lastAccessed: -1 });
    
    const stats = {
      totalChapters: progress.length,
      completedChapters: progress.filter(p => p.completed).length,
      totalQuizzes: progress.reduce((sum, p) => sum + p.quizAttempts.length, 0),
      averageScore: progress.length > 0
        ? Math.round(progress.reduce((sum, p) => sum + p.bestScore, 0) / progress.length)
        : 0
    };
    
    res.json({ progress, stats });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get progress for a specific subject
router.get('/subject/:subjectId', auth, async (req, res) => {
  try {
    const progress = await Progress.find({
      user: req.user._id,
      subject: req.params.subjectId
    })
      .populate('chapter', 'title chapterNumber')
      .sort({ 'chapter.chapterNumber': 1 });
    
    res.json(progress);
  } catch (error) {
    console.error('Get subject progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



