const express = require('express');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all subjects for Class 10 with proper chapter count
router.get('/', auth, async (req, res) => {
  try {
    const subjects = await Subject.find({ class: '10' }).sort({ name: 1 });
    
    // Get chapter counts for each subject
    const subjectsWithChapters = await Promise.all(
      subjects.map(async (subject) => {
        const chapterCount = await Chapter.countDocuments({
          $or: [
            { subjectId: subject._id },
            { subject: subject._id }
          ]
        });
        
        // Get chapter list
        const chapters = await Chapter.find({
          $or: [
            { subjectId: subject._id },
            { subject: subject._id }
          ]
        })
          .select('chapterTitle title chapterNumber')
          .sort({ chapterNumber: 1 })
          .limit(10); // Limit for performance
        
        const result = {
          ...subject.toObject(),
          chapters: chapters.map(c => ({
            _id: c._id,
            title: c.chapterTitle || c.title,
            chapterNumber: c.chapterNumber
          })),
          chapterCount
        };
        
        // Log for debugging
        console.log(`📚 ${subject.name}: ${chapterCount} chapters`);
        
        return result;
      })
    );
    
    console.log(`✅ Returning ${subjectsWithChapters.length} subjects with chapter counts`);
    res.json(subjectsWithChapters);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all chapters for a subject
router.get('/:id/chapters', auth, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Get chapters by subjectId or subject (for backward compatibility)
    const chapters = await Chapter.find({
      $or: [
        { subjectId: subject._id },
        { subject: subject._id }
      ]
    })
      .select('chapterTitle title chapterNumber difficulty estimatedTime contentHTML chapterContent')
      .sort({ chapterNumber: 1 });
    
    res.json(chapters);
  } catch (error) {
    console.error('Get chapters error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single subject with all chapters
router.get('/:id', auth, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Get chapters by subjectId or subject (for backward compatibility)
    const chapters = await Chapter.find({
      $or: [
        { subjectId: subject._id },
        { subject: subject._id }
      ]
    })
      .select('chapterTitle title chapterNumber difficulty estimatedTime')
      .sort({ chapterNumber: 1 });
    
    const subjectData = {
      ...subject.toObject(),
      chapters: chapters.map(c => ({
        _id: c._id,
        title: c.chapterTitle || c.title,
        chapterTitle: c.chapterTitle || c.title,
        chapterNumber: c.chapterNumber,
        difficulty: c.difficulty,
        estimatedTime: c.estimatedTime
      })),
      chapterCount: chapters.length
    };
    
    res.json(subjectData);
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search subjects and chapters
router.get('/search/:query', auth, async (req, res) => {
  try {
    const query = req.params.query;
    const searchRegex = new RegExp(query, 'i');
    
    const subjects = await Subject.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex }
      ],
      class: '10'
    }).populate({
      path: 'chapters',
      match: {
        $or: [
          { title: searchRegex },
          { keywords: { $in: [searchRegex] } }
        ]
      },
      select: 'title chapterNumber'
    });
    
    res.json(subjects);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

