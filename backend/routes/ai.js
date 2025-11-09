const express = require('express');
const Chapter = require('../models/Chapter');
const { auth } = require('../middleware/auth');
const { generateSummary, chatWithAI, generateQuiz } = require('../utils/gemini');

const router = express.Router();

// Generate chapter summary
router.post('/summary/:chapterId', auth, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    
    let summary = chapter.summary;
    
    if (!summary) {
      summary = await generateSummary(chapter.content);
      chapter.summary = summary;
      await chapter.save();
    }
    
    res.json({ summary });
  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(500).json({ message: 'Failed to generate summary' });
  }
});

// Chat with AI for doubt solving
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, chapterId, history = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }
    
    let chapterContext = '';
    if (chapterId) {
      const chapter = await Chapter.findById(chapterId);
      if (chapter) {
        chapterContext = `Chapter: ${chapter.title}\nContent: ${chapter.content.substring(0, 1000)}`;
      }
    }
    
    const messages = [
      ...history,
      { role: 'user', content: message }
    ];
    
    const response = await chatWithAI(messages, chapterContext);
    
    res.json({ response });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ message: 'Failed to get AI response' });
  }
});

// Generate quiz using AI
router.post('/generate-quiz/:chapterId', auth, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    
    const numberOfQuestions = req.body.numberOfQuestions || 5;
    const questions = await generateQuiz(chapter.content, numberOfQuestions);
    
    res.json({ questions });
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({ message: 'Failed to generate quiz' });
  }
});

module.exports = router;



