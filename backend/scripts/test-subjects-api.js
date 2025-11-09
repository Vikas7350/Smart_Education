const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');

dotenv.config();

const testSubjectsAPI = async () => {
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

    const subjects = await Subject.find({ class: '10' }).sort({ name: 1 });
    
    console.log('📊 Testing Subjects API Response:\n');
    
    const subjectsWithChapters = await Promise.all(
      subjects.map(async (subject) => {
        const chapterCount = await Chapter.countDocuments({
          $or: [
            { subjectId: subject._id },
            { subject: subject._id }
          ]
        });
        
        console.log(`${subject.name}:`);
        console.log(`  - Subject ID: ${subject._id}`);
        console.log(`  - Chapter Count: ${chapterCount}`);
        
        // Check a few chapters to see their subjectId
        if (chapterCount > 0) {
          const sampleChapters = await Chapter.find({
            $or: [
              { subjectId: subject._id },
              { subject: subject._id }
            ]
          }).limit(3).select('chapterTitle subjectId subject');
          
          console.log(`  - Sample chapters:`);
          sampleChapters.forEach(ch => {
            console.log(`    * ${ch.chapterTitle}`);
            console.log(`      subjectId: ${ch.subjectId}`);
            console.log(`      subject: ${ch.subject}`);
          });
        } else {
          // Check if there are chapters with wrong subjectId
          const allChapters = await Chapter.find({}).limit(5);
          console.log(`  - ⚠️  No chapters found. Checking all chapters...`);
          console.log(`  - Total chapters in DB: ${await Chapter.countDocuments({})}`);
          if (allChapters.length > 0) {
            console.log(`  - Sample chapter subjectIds:`);
            allChapters.forEach(ch => {
              console.log(`    * ${ch.chapterTitle || ch.title}: subjectId=${ch.subjectId}, subject=${ch.subject}`);
            });
          }
        }
        console.log('');
        
        return {
          ...subject.toObject(),
          chapterCount
        };
      })
    );
    
    console.log('\n📋 Summary:');
    subjectsWithChapters.forEach(s => {
      console.log(`  ${s.name}: ${s.chapterCount} chapters`);
    });
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testSubjectsAPI();

