const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get leaderboard
router.get('/', auth, async (req, res) => {
  try {
    const { type = 'points', limit = 50 } = req.query;
    
    let sortField = 'points';
    if (type === 'streak') {
      sortField = 'streak';
    }
    
    const users = await User.find({ role: 'student', class: '10' })
      .select('name points streak badges')
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit));
    
    // Add rank
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      points: user.points,
      streak: user.streak,
      badges: user.badges,
      isCurrentUser: user._id.toString() === req.user._id.toString()
    }));
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



