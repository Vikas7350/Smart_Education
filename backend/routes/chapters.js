const express = require('express');
const Chapter = require('../models/Chapter');
const Subject = require('../models/Subject');
const Progress = require('../models/Progress');
const Quiz = require('../models/Quiz');
const { auth } = require('../middleware/auth');
const { checkSubscription } = require('../middleware/checkSubscription');
const { generateDeepChapterContent, generateSummary, generateQuiz } = require('../utils/gemini');

const router = express.Router();

// Get all chapters for a subject with progress state
router.get('/subject/:subjectId', auth, async (req, res) => {
  try {
    // Find chapters by subjectId or subject (for backward compatibility)
    const chapters = await Chapter.find({
      $or: [
        { subjectId: req.params.subjectId },
        { subject: req.params.subjectId }
      ]
    })
      .select('chapterTitle title chapterNumber difficulty estimatedTime chapterContent content')
      .sort({ chapterNumber: 1 });
    
    // Get progress for all chapters
    const progressList = await Progress.find({
      user: req.user._id,
      chapter: { $in: chapters.map(c => c._id) }
    });
    
    // Map progress state to chapters
    const chaptersWithProgress = chapters.map(chapter => {
      const progress = progressList.find(p => p.chapter.toString() === chapter._id.toString());
      
      let progressState = 'Not Started';
      if (progress) {
        if (progress.completed) {
          progressState = 'Completed';
        } else if (progress.quizAttempts && progress.quizAttempts.length > 0) {
          progressState = 'In Progress';
        }
      }
      
      // Get preview text (first 100 chars of content)
      const content = chapter.chapterContent || chapter.content || '';
      const previewText = content.replace(/<[^>]*>/g, '').substring(0, 100) + '...';
      
      return {
        _id: chapter._id,
        chapterTitle: chapter.chapterTitle || chapter.title,
        chapterNumber: chapter.chapterNumber,
        difficulty: chapter.difficulty,
        estimatedTime: chapter.estimatedTime,
        previewText,
        progressState
      };
    });
    
    res.json(chaptersWithProgress);
  } catch (error) {
    console.error('Get chapters error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single chapter with content (auto-generate if missing) - Protected by subscription
router.get('/:id', auth, checkSubscription, async (req, res) => {
  try {
    let chapter = await Chapter.findById(req.params.id)
      .populate('subjectId', 'name')
      .populate('subject', 'name')
      .populate('quiz', 'title questions timeLimit');
    
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    
    const subject = chapter.subjectId || chapter.subject;
    const subjectName = subject?.name || 'Unknown Subject';
    const chapterName = chapter.chapterTitle || chapter.title;
    
    // Auto-generate contentHTML if missing or too short
    const hasContent = chapter.contentHTML && chapter.contentHTML.length > 200;
    const hasOldContent = chapter.chapterContent && chapter.chapterContent.length > 200;
    
    if (!hasContent && !hasOldContent) {
      try {
        console.log(`🔄 Generating content for chapter: ${chapterName} (${subjectName})`);
        const generatedContent = await generateDeepChapterContent(chapterName, subjectName);
        
        if (generatedContent && generatedContent.length > 200) {
          chapter.contentHTML = generatedContent;
          chapter.chapterContent = generatedContent; // Backward compatibility
          chapter.content = generatedContent; // Backward compatibility
          await chapter.save();
          console.log(`✅ Content generated for: ${chapterName} (${generatedContent.length} chars)`);
          
          // Reload chapter to get updated content
          chapter = await Chapter.findById(req.params.id)
            .populate('subjectId', 'name')
            .populate('subject', 'name')
            .populate('quiz', 'title questions timeLimit');
        } else {
          console.warn(`⚠️  Generated content too short for: ${chapterName}`);
        }
      } catch (error) {
        console.error(`❌ Error generating content for ${chapterName}:`, error.message);
        // Continue with existing content or empty
      }
    }
    
    // Auto-generate quiz if missing and content exists
    if (!chapter.quiz && (chapter.contentHTML || chapter.chapterContent)) {
      try {
        console.log(`Generating quiz for chapter: ${chapterName}`);
        const content = chapter.contentHTML || chapter.chapterContent || chapter.content || '';
        const questions = await generateQuiz(content, 10);
        
        const quiz = new Quiz({
          title: `Quiz: ${chapterName}`,
          chapter: chapter._id,
          subject: chapter.subjectId || chapter.subject,
          questions: questions,
          totalPoints: questions.length * 10,
          timeLimit: 600 // 10 minutes
        });
        await quiz.save();
        
        chapter.quiz = quiz._id;
        await chapter.save();
        console.log(`✅ Quiz generated for: ${chapterName}`);
        
        // Reload chapter with quiz
        await chapter.populate('quiz', 'title questions timeLimit');
      } catch (error) {
        console.error('Error generating quiz:', error);
        // Continue without quiz
      }
    }
    
    // Ensure backward compatibility
    if (!chapter.title) chapter.title = chapter.chapterTitle;
    if (!chapter.content) chapter.content = chapter.contentHTML || chapter.chapterContent;
    if (!chapter.subject) chapter.subject = chapter.subjectId;
    
    // Update or create progress
    let progress = await Progress.findOne({
      user: req.user._id,
      chapter: chapter._id
    });
    
    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        chapter: chapter._id,
        subject: chapter.subjectId || chapter.subject
      });
    }
    
    progress.lastAccessed = new Date();
    await progress.save();
    
    res.json({ chapter, progress });
  } catch (error) {
    console.error('Get chapter error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark chapter as completed
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    
    let progress = await Progress.findOne({
      user: req.user._id,
      chapter: chapter._id
    });
    
    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        chapter: chapter._id,
        subject: chapter.subjectId || chapter.subject
      });
    }
    
    progress.completed = true;
    progress.completedAt = new Date();
    await progress.save();
    
    res.json({ message: 'Chapter marked as completed', progress });
  } catch (error) {
    console.error('Complete chapter error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate summary for chapter
router.post('/:id/generate-summary', auth, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    
    const content = chapter.contentHTML || chapter.chapterContent || chapter.content || '';
    if (!content) {
      return res.status(400).json({ message: 'Chapter content is empty' });
    }
    
    const summary = await generateSummary(content);
    chapter.summary = summary;
    await chapter.save();
    
    res.json({ summary });
  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(500).json({ message: 'Failed to generate summary' });
  }
});

// Generate quiz for chapter
router.post('/:id/generate-quiz', auth, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id)
      .populate('subjectId', 'name')
      .populate('subject', 'name');
    
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    
    const content = chapter.contentHTML || chapter.chapterContent || chapter.content || '';
    if (!content) {
      return res.status(400).json({ message: 'Chapter content is empty' });
    }
    
    // Generate 10 questions
    const questions = await generateQuiz(content, 10);
    
    // Check if quiz already exists
    let quiz = await Quiz.findOne({ chapter: chapter._id });
    
    if (quiz) {
      // Update existing quiz
      quiz.questions = questions;
      quiz.totalPoints = questions.length * 10;
      await quiz.save();
    } else {
      // Create new quiz
      quiz = new Quiz({
        title: `Quiz: ${chapter.chapterTitle || chapter.title}`,
        chapter: chapter._id,
        subject: chapter.subjectId || chapter.subject,
        questions: questions,
        totalPoints: questions.length * 10,
        timeLimit: 600 // 10 minutes
      });
      await quiz.save();
      
      // Link quiz to chapter
      chapter.quiz = quiz._id;
      await chapter.save();
    }
    
    res.json({ quiz, message: 'Quiz generated successfully' });
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({ message: 'Failed to generate quiz' });
  }
});

module.exports = router;

