const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');

dotenv.config();

const checkDBState = async () => {
  try {
    const mongoOptions = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 1,
      retryWrites: true
    };
    
    if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb+srv')) {
      mongoOptions.tls = true;
      mongoOptions.tlsAllowInvalidCertificates = true;
      mongoOptions.tlsAllowInvalidHostnames = true;
    }

    await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    console.log('✅ Connected to MongoDB\n');

    const totalSubjects = await Subject.countDocuments({});
    const totalChapters = await Chapter.countDocuments({});
    
    console.log(`📊 Database State:`);
    console.log(`   Total Subjects: ${totalSubjects}`);
    console.log(`   Total Chapters: ${totalChapters}\n`);

    const subjects = await Subject.find({ class: '10' }).sort({ name: 1 });
    
    console.log('📚 Subjects and their chapters:\n');
    
    for (const subject of subjects) {
      const chapters = await Chapter.find({
        $or: [
          { subjectId: subject._id },
          { subject: subject._id }
        ]
      });
      
      console.log(`${subject.name} (ID: ${subject._id}):`);
      console.log(`  - Chapters: ${chapters.length}`);
      if (chapters.length > 0) {
        console.log(`  - Sample: ${chapters[0].chapterTitle}`);
      }
      console.log('');
    }
    
    // Check for orphaned chapters
    const allChapters = await Chapter.find({}).limit(10);
    console.log('\n🔍 Sample chapters:');
    for (const ch of allChapters) {
      const subject = await Subject.findById(ch.subjectId || ch.subject);
      console.log(`  - ${ch.chapterTitle}: subjectId=${ch.subjectId}, subject=${ch.subject}, linkedSubject=${subject?.name || 'NOT FOUND'}`);
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkDBState();

