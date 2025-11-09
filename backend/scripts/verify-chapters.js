const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Chapter = require('../models/Chapter');
const Subject = require('../models/Subject');

dotenv.config();

const verifyChapters = async () => {
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
    
    console.log('📊 Chapter Counts by Subject:\n');
    
    for (const subject of subjects) {
      const count = await Chapter.countDocuments({
        $or: [
          { subjectId: subject._id },
          { subject: subject._id }
        ]
      });
      
      console.log(`${subject.name}: ${count} chapters`);
      
      if (count === 0) {
        // Check if there are any chapters that might not be linked
        const allChapters = await Chapter.find({});
        console.log(`  ⚠️  Warning: No chapters found for ${subject.name}`);
        console.log(`  Total chapters in DB: ${allChapters.length}`);
      }
    }
    
    const totalChapters = await Chapter.countDocuments({});
    console.log(`\n📚 Total chapters in database: ${totalChapters}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

verifyChapters();



