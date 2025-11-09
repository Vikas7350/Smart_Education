const express = require('express');
const Quiz = require('../models/Quiz');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { checkSubscription } = require('../middleware/checkSubscription');

const router = express.Router();

// Get quiz for a chapter - Protected by subscription
router.get('/chapter/:chapterId', auth, checkSubscription, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ chapter: req.params.chapterId })
      .populate('chapter', 'title')
      .populate('subject', 'name');
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Remove correct answers from response
    const quizData = quiz.toObject();
    quizData.questions = quizData.questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      points: q.points
    }));
    
    res.json(quizData);
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit quiz
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body; // answers: { questionId: answerIndex }
    
    const quiz = await Quiz.findById(req.params.id)
      .populate('chapter', '_id')
      .populate('subject', '_id');
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    let correctAnswers = 0;
    let totalPoints = 0;
    const results = [];
    
    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[question._id] ?? answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
        totalPoints += question.points || 10;
      }
      
      results.push({
        questionId: question._id,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      });
    });
    
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    
    // Update progress
    let progress = await Progress.findOne({
      user: req.user._id,
      chapter: quiz.chapter._id
    });
    
    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        chapter: quiz.chapter._id,
        subject: quiz.subject._id
      });
    }
    
    progress.quizAttempts.push({
      quiz: quiz._id,
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      timeTaken: timeTaken || 0
    });
    
    if (score > progress.bestScore) {
      progress.bestScore = score;
    }
    
    await progress.save();
    
    // Update user points
    const user = await User.findById(req.user._id);
    user.points += totalPoints;
    await user.save();
    
    res.json({
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      totalPoints,
      results,
      bestScore: progress.bestScore
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get daily challenge
router.get('/daily-challenge', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const quiz = await Quiz.findOne({
      isDailyChallenge: true,
      challengeDate: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate('subject', 'name');
    
    if (!quiz) {
      return res.status(404).json({ message: 'No daily challenge available' });
    }
    
    // Remove correct answers
    const quizData = quiz.toObject();
    quizData.questions = quizData.questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      points: q.points
    }));
    
    res.json(quizData);
  } catch (error) {
    console.error('Get daily challenge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



