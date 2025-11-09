const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Chapter = require('../models/Chapter');
const Subject = require('../models/Subject');
const { generateDeepChapterContent } = require('../utils/gemini');

dotenv.config();

const generateAllContent = async () => {
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

    let connected = false;
    for (let i = 0; i < 3; i++) {
      try {
        await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
        connected = true;
        console.log('✅ Connected to MongoDB\n');
        break;
      } catch (err) {
        if (i < 2) {
          console.log(`Connection attempt ${i + 1} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          throw err;
        }
      }
    }

    if (!connected) {
      throw new Error('Failed to connect after 3 attempts');
    }

    // Get all chapters that need content
    const chapters = await Chapter.find({
      $or: [
        { contentHTML: { $exists: false } },
        { contentHTML: '' },
        { $expr: { $lt: [{ $strLenCP: { $ifNull: ['$contentHTML', ''] } }, 200] } }
      ]
    })
      .populate('subjectId', 'name')
      .populate('subject', 'name')
      .sort({ chapterNumber: 1 });

    console.log(`📚 Found ${chapters.length} chapters that need content generation\n`);

    if (chapters.length === 0) {
      console.log('✅ All chapters already have content!');
      process.exit(0);
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      const subject = chapter.subjectId || chapter.subject;
      const subjectName = subject?.name || 'Unknown Subject';
      const chapterName = chapter.chapterTitle || chapter.title;

      console.log(`\n[${i + 1}/${chapters.length}] Generating content for: ${chapterName} (${subjectName})`);

      try {
        // Generate content with retry logic
        let generatedContent = null;
        let retries = 3;
        
        while (retries > 0 && !generatedContent) {
          try {
            generatedContent = await generateDeepChapterContent(chapterName, subjectName);
            
            // Validate content
            if (generatedContent && generatedContent.length > 200) {
              break;
            } else {
              console.log(`  ⚠️  Content too short, retrying...`);
              generatedContent = null;
              retries--;
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          } catch (error) {
            console.log(`  ⚠️  Error: ${error.message}, retrying...`);
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
          }
        }

        if (generatedContent && generatedContent.length > 200) {
          // Save content
          chapter.contentHTML = generatedContent;
          chapter.chapterContent = generatedContent; // Backward compatibility
          chapter.content = generatedContent; // Backward compatibility
          await chapter.save();
          
          console.log(`  ✅ Content generated (${generatedContent.length} characters)`);
          successCount++;
        } else {
          console.log(`  ❌ Failed to generate content after retries`);
          errorCount++;
        }

        // Add delay between requests to avoid rate limiting
        if (i < chapters.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`  ❌ Error: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Generation Summary:');
    console.log(`   ✅ Success: ${successCount} chapters`);
    console.log(`   ❌ Errors: ${errorCount} chapters`);
    console.log(`   📚 Total: ${chapters.length} chapters`);
    console.log('='.repeat(50) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

generateAllContent();



