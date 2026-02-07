const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Quiz = require('../models/Quiz');

dotenv.config();

const seedAllChapters = async () => {
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

    // Retry connection
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

    // Subjects data
    const subjectsData = [
      { id: 'maths', name: 'Mathematics', description: 'Learn algebra, geometry, trigonometry, and more', icon: '🔢', color: '#6366f1', class: '10' },
      { id: 'science', name: 'Science', description: 'Physics, Chemistry, Biology for Class 10', icon: '🔬', color: '#10b981', class: '10' },
      { id: 'sst', name: 'Social Science', description: 'History, Geography, Civics, and Economics', icon: '🌍', color: '#f59e0b', class: '10' },
      { id: 'english', name: 'English', description: 'Literature, Grammar, and Communication Skills', icon: '📖', color: '#ef4444', class: '10' },
      { id: 'hindi', name: 'Hindi', description: 'व्याकरण और साहित्य', icon: '📝', color: '#8b5cf6', class: '10' }
    ];

    // Chapters data
    const chaptersData = {
      maths: [
        { chapterNumber: 1, chapterTitle: 'Real Numbers' },
        { chapterNumber: 2, chapterTitle: 'Polynomials' },
        { chapterNumber: 3, chapterTitle: 'Pair of Linear Equations in Two Variables' },
        { chapterNumber: 4, chapterTitle: 'Quadratic Equations' },
        { chapterNumber: 5, chapterTitle: 'Arithmetic Progressions' },
        { chapterNumber: 6, chapterTitle: 'Triangles' },
        { chapterNumber: 7, chapterTitle: 'Coordinate Geometry' },
        { chapterNumber: 8, chapterTitle: 'Introduction to Trigonometry' },
        { chapterNumber: 9, chapterTitle: 'Applications of Trigonometry' },
        { chapterNumber: 10, chapterTitle: 'Circles' },
        { chapterNumber: 11, chapterTitle: 'Constructions' },
        { chapterNumber: 12, chapterTitle: 'Areas Related to Circles' },
        { chapterNumber: 13, chapterTitle: 'Surface Areas and Volumes' },
        { chapterNumber: 14, chapterTitle: 'Statistics' },
        { chapterNumber: 15, chapterTitle: 'Probability' }
      ],
      science: [
        { chapterNumber: 1, chapterTitle: 'Chemical Reactions and Equations' },
        { chapterNumber: 2, chapterTitle: 'Acids, Bases and Salts' },
        { chapterNumber: 3, chapterTitle: 'Metals and Non-Metals' },
        { chapterNumber: 4, chapterTitle: 'Carbon and its Compounds' },
        { chapterNumber: 5, chapterTitle: 'Periodic Classification of Elements' },
        { chapterNumber: 6, chapterTitle: 'Life Processes' },
        { chapterNumber: 7, chapterTitle: 'Control and Coordination' },
        { chapterNumber: 8, chapterTitle: 'How do Organisms Reproduce' },
        { chapterNumber: 9, chapterTitle: 'Heredity and Evolution' },
        { chapterNumber: 10, chapterTitle: 'Light – Reflection and Refraction' },
        { chapterNumber: 11, chapterTitle: 'Human Eye and Colorful World' },
        { chapterNumber: 12, chapterTitle: 'Electricity' },
        { chapterNumber: 13, chapterTitle: 'Magnetic Effects of Electric Current' },
        { chapterNumber: 14, chapterTitle: 'Sources of Energy' },
        { chapterNumber: 15, chapterTitle: 'Our Environment' },
        { chapterNumber: 16, chapterTitle: 'Sustainable Management of Natural Resources' }
      ],
      sst: [
        { chapterNumber: 1, chapterTitle: 'Resources and Development' },
        { chapterNumber: 2, chapterTitle: 'Forest and Wildlife Resources' },
        { chapterNumber: 3, chapterTitle: 'Water Resources' },
        { chapterNumber: 4, chapterTitle: 'Agriculture' },
        { chapterNumber: 5, chapterTitle: 'Minerals and Energy Resources' },
        { chapterNumber: 6, chapterTitle: 'Manufacturing Industries' },
        { chapterNumber: 7, chapterTitle: 'Lifelines of National Economy' },
        { chapterNumber: 8, chapterTitle: 'Power Sharing' },
        { chapterNumber: 9, chapterTitle: 'Federalism' },
        { chapterNumber: 10, chapterTitle: 'Gender, Religion and Caste' },
        { chapterNumber: 11, chapterTitle: 'Political Parties' },
        { chapterNumber: 12, chapterTitle: 'Outcomes of Democracy' },
        { chapterNumber: 13, chapterTitle: 'Development' },
        { chapterNumber: 14, chapterTitle: 'Sectors of Indian Economy' },
        { chapterNumber: 15, chapterTitle: 'Money and Credit' },
        { chapterNumber: 16, chapterTitle: 'Globalization and The Indian Economy' }
      ],
      english: [
        { chapterNumber: 1, chapterTitle: 'A Letter to God' },
        { chapterNumber: 2, chapterTitle: 'Nelson Mandela: Long Walk to Freedom' },
        { chapterNumber: 3, chapterTitle: 'Two Stories About Flying' },
        { chapterNumber: 4, chapterTitle: 'From the Diary of Anne Frank' },
        { chapterNumber: 5, chapterTitle: 'The Hundred Dresses I & II' },
        { chapterNumber: 6, chapterTitle: 'Glimpses of India' },
        { chapterNumber: 7, chapterTitle: 'Mijbil the Otter' },
        { chapterNumber: 8, chapterTitle: 'Madam Rides the Bus' },
        { chapterNumber: 9, chapterTitle: 'The Sermon at Benares' },
        { chapterNumber: 10, chapterTitle: 'The Proposal' }
      ],
      hindi: [
        { chapterNumber: 1, chapterTitle: 'सखियों के बीच' },
        { chapterNumber: 2, chapterTitle: 'टोपी' },
        { chapterNumber: 3, chapterTitle: 'मानवीयता' },
        { chapterNumber: 4, chapterTitle: 'एक कहानी यह भी' },
        { chapterNumber: 5, chapterTitle: 'सूरदास के पद' },
        { chapterNumber: 6, chapterTitle: 'अतिथि' },
        { chapterNumber: 7, chapterTitle: 'बड़े भाई साहब' },
        { chapterNumber: 8, chapterTitle: 'डायरी का एक पन्ना' }
      ]
    };

    console.log('📚 Creating/Updating Subjects...\n');

    // Create or update subjects
    const createdSubjects = {};
    for (const subjectData of subjectsData) {
      let subject = await Subject.findOne({ name: subjectData.name });
      
      if (!subject) {
        subject = await Subject.create(subjectData);
        console.log(`✅ Created subject: ${subject.name}`);
      } else {
        // Update existing subject
        Object.assign(subject, subjectData);
        await subject.save();
        console.log(`✅ Updated subject: ${subject.name}`);
      }
      
      createdSubjects[subjectData.id] = subject;
    }

    console.log('\n📖 Creating Chapters...\n');

    // Don't delete all chapters - use upsert instead to avoid data loss
    // await Chapter.deleteMany({});
    // console.log('🗑️  Cleared existing chapters\n');

    // Create chapters for each subject
    let totalChapters = 0;
    for (const [subjectId, chapters] of Object.entries(chaptersData)) {
      const subject = createdSubjects[subjectId];
      if (!subject) {
        console.log(`⚠️  Subject ${subjectId} not found, skipping chapters`);
        continue;
      }

      console.log(`\n📘 Creating chapters for ${subject.name}...`);
      
      for (const chapterData of chapters) {
        let created = false;
        for (let attempt = 0; attempt < 5; attempt++) {
          try {
            // Use findOneAndUpdate with upsert to avoid duplicates
            const chapter = await Chapter.findOneAndUpdate(
              {
                subjectId: subject._id,
                chapterNumber: chapterData.chapterNumber,
                chapterTitle: chapterData.chapterTitle
              },
              {
                chapterTitle: chapterData.chapterTitle,
                subjectId: subject._id,
                subject: subject._id, // Backward compatibility
                title: chapterData.chapterTitle, // Backward compatibility
                chapterNumber: chapterData.chapterNumber,
                chapterContent: '', // Will be auto-generated when opened
                contentHTML: '', // Will be auto-generated when opened
                content: '', // Backward compatibility
                difficulty: 'medium',
                estimatedTime: 45,
                keywords: []
              },
              {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
              }
            );
            
            if (created || attempt === 0) {
              console.log(`  ✅ Chapter ${chapterData.chapterNumber}: ${chapterData.chapterTitle}`);
            }
            totalChapters++;
            created = true;
            
            // Small delay to avoid connection issues
            await new Promise(resolve => setTimeout(resolve, 200));
            break;
          } catch (error) {
            if (attempt < 4) {
              console.log(`  ⚠️  Retrying ${chapterData.chapterTitle}... (attempt ${attempt + 2})`);
              await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            } else {
              console.error(`  ❌ Failed to create: ${chapterData.chapterTitle} - ${error.message}`);
            }
          }
        }
      }

      // Update subject with chapter references
      const subjectChapters = await Chapter.find({
        $or: [
          { subjectId: subject._id },
          { subject: subject._id }
        ]
      });
      
      await Subject.findByIdAndUpdate(subject._id, {
        chapters: subjectChapters.map(c => c._id)
      });
      
      console.log(`  📊 Total: ${subjectChapters.length} chapters`);
    }

    // Create admin user if doesn't exist
    let admin = await User.findOne({ email: 'admin@smarteducation.com' });
    if (!admin) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@smarteducation.com',
        password: adminPassword,
        class: '10',
        role: 'admin',
        points: 0,
        streak: 0
      });
      console.log('\n✅ Created admin user');
    }

    // Create sample student if doesn't exist
    let student = await User.findOne({ email: 'vikas@example.com' });
    if (!student) {
      const studentPassword = await bcrypt.hash('student123', 10);
      student = await User.create({
        name: 'Vikas',
        email: 'vikas@example.com',
        password: studentPassword,
        class: '10',
        role: 'student',
        points: 0,
        streak: 0
      });
      console.log('✅ Created sample student');
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Subjects: ${subjectsData.length}`);
    console.log(`   - Total Chapters: ${totalChapters}`);
    console.log(`\n💡 Note: Chapter content will be auto-generated using Gemini API when chapters are opened.`);
    console.log(`\n🔑 Login credentials:`);
    console.log(`   Admin: admin@smarteducation.com / admin123`);
    console.log(`   Student: vikas@example.com / student123`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedAllChapters();



