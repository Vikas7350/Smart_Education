const express = require('express');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Quiz = require('../models/Quiz');
const { auth, adminAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// All admin routes require admin authentication
router.use(adminAuth);

// Subjects
router.post('/subjects', [
  body('name').notEmpty().withMessage('Name is required'),
  body('class').equals('10').withMessage('Only Class 10 is supported')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const subject = new Subject(req.body);
    await subject.save();
    res.status(201).json(subject);
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/subjects/:id', async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    res.json(subject);
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/subjects/:id', async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json({ message: 'Subject deleted' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Chapters
router.post('/chapters', [
  body('title').notEmpty().withMessage('Title is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const chapter = new Chapter(req.body);
    await chapter.save();
    
    // Add chapter to subject
    await Subject.findByIdAndUpdate(chapter.subject, {
      $push: { chapters: chapter._id }
    });
    
    res.status(201).json(chapter);
  } catch (error) {
    console.error('Create chapter error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/chapters/:id', async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    
    res.json(chapter);
  } catch (error) {
    console.error('Update chapter error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/chapters/:id', async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    
    // Remove from subject
    await Subject.findByIdAndUpdate(chapter.subject, {
      $pull: { chapters: chapter._id }
    });
    
    await Chapter.findByIdAndDelete(req.params.id);
    res.json({ message: 'Chapter deleted' });
  } catch (error) {
    console.error('Delete chapter error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Quizzes
router.post('/quizzes', [
  body('title').notEmpty().withMessage('Title is required'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const quiz = new Quiz(req.body);
    await quiz.save();
    
    // Link quiz to chapter if provided
    if (quiz.chapter) {
      await Chapter.findByIdAndUpdate(quiz.chapter, { quiz: quiz._id });
    }
    
    res.status(201).json(quiz);
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    res.json(quiz);
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json({ message: 'Quiz deleted' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



