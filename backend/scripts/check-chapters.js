const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Chapter = require('../models/Chapter');
const Subject = require('../models/Subject');

dotenv.config();

const checkChapters = async () => {
  try {
    const mongoOptions = {};
    if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb+srv')) {
      mongoOptions.tls = true;
      mongoOptions.tlsAllowInvalidCertificates = true;
      mongoOptions.tlsAllowInvalidHostnames = true;
    }

    await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    console.log('✅ Connected to MongoDB\n');

    const subjects = await Subject.find({ class: '10' });
    console.log('Subjects found:');
    subjects.forEach(s => {
      console.log(`  - ${s.name} (ID: ${s._id})`);
    });

    console.log('\nChapters found:');
    const chapters = await Chapter.find({});
    chapters.forEach(c => {
      console.log(`  - ${c.chapterTitle || c.title}`);
      console.log(`    subjectId: ${c.subjectId}`);
      console.log(`    subject: ${c.subject}`);
    });

    console.log('\nChapter counts per subject:');
    for (const subject of subjects) {
      const count = await Chapter.countDocuments({
        $or: [
          { subjectId: subject._id },
          { subject: subject._id }
        ]
      });
      console.log(`  ${subject.name}: ${count} chapters`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkChapters();



