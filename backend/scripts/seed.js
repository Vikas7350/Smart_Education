const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Quiz = require('../models/Quiz');

dotenv.config();

const seedData = async () => {
  try {
    const mongoOptions = {};

    // For MongoDB Atlas (mongodb+srv), add SSL options
    if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb+srv')) {
      mongoOptions.tls = true;
      // Try allowing invalid certificates as a workaround for SSL issues
      mongoOptions.tlsAllowInvalidCertificates = true;
      mongoOptions.tlsAllowInvalidHostnames = true;
    }

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_education', mongoOptions);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Chapter.deleteMany({});
    await Quiz.deleteMany({});

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@smarteducation.com',
      password: adminPassword,
      class: '10',
      role: 'admin',
      points: 0,
      streak: 0
    });
    console.log('✅ Created admin user');

    // Create sample student
    const studentPassword = await bcrypt.hash('student123', 10);
    const student = await User.create({
      name: 'Vikas',
      email: 'vikas@example.com',
      password: studentPassword,
      class: '10',
      role: 'student',
      points: 0,
      streak: 0
    });
    console.log('✅ Created sample student');

    // Create subjects
    const subjects = [
      {
        name: 'Mathematics',
        description: 'Learn algebra, geometry, trigonometry, and more',
        icon: '🔢',
        color: '#6366f1',
        class: '10'
      },
      {
        name: 'Science',
        description: 'Physics, Chemistry, and Biology for Class 10',
        icon: '🔬',
        color: '#10b981',
        class: '10'
      },
      {
        name: 'Social Science',
        description: 'History, Geography, Civics, and Economics',
        icon: '🌍',
        color: '#f59e0b',
        class: '10'
      },
      {
        name: 'English',
        description: 'Literature, Grammar, and Communication Skills',
        icon: '📖',
        color: '#ef4444',
        class: '10'
      },
      {
        name: 'Hindi',
        description: 'हिंदी व्याकरण और साहित्य',
        icon: '📝',
        color: '#8b5cf6',
        class: '10'
      }
    ];

    // Insert subjects one by one to avoid SSL connection issues
    const createdSubjects = [];
    for (const subject of subjects) {
      try {
        const created = await Subject.create(subject);
        createdSubjects.push(created);
      } catch (error) {
        console.error(`Error creating subject ${subject.name}:`, error.message);
        // Try to find existing subject
        const existing = await Subject.findOne({ name: subject.name });
        if (existing) {
          createdSubjects.push(existing);
        }
      }
    }
    console.log('✅ Created subjects');

    // Create sample chapters
    const mathSubject = createdSubjects.find(s => s.name === 'Mathematics');
    const scienceSubject = createdSubjects.find(s => s.name === 'Science');

    const chapters = [
      {
        chapterTitle: 'Real Numbers',
        subjectId: mathSubject._id,
        subject: mathSubject._id, // Backward compatibility
        title: 'Real Numbers', // Backward compatibility
        chapterNumber: 1,
        chapterContent: `# Real Numbers

## Introduction
Real numbers are the foundation of mathematics. They include all rational and irrational numbers.

## Key Concepts

### Rational Numbers
Rational numbers can be expressed as a fraction p/q where p and q are integers and q ≠ 0.

Examples:
- 1/2
- 3/4
- -5/7

### Irrational Numbers
Irrational numbers cannot be expressed as a fraction. Their decimal expansion is non-terminating and non-recurring.

Examples:
- √2
- π
- e

## Important Theorems

### Euclid's Division Lemma
For any two positive integers a and b, there exist unique integers q and r such that:
a = bq + r, where 0 ≤ r < b

### Fundamental Theorem of Arithmetic
Every composite number can be expressed as a product of primes, and this factorization is unique.`,
        content: `# Real Numbers

## Introduction
Real numbers are the foundation of mathematics. They include all rational and irrational numbers.

## Key Concepts

### Rational Numbers
Rational numbers can be expressed as a fraction p/q where p and q are integers and q ≠ 0.

Examples:
- 1/2
- 3/4
- -5/7

### Irrational Numbers
Irrational numbers cannot be expressed as a fraction. Their decimal expansion is non-terminating and non-recurring.

Examples:
- √2
- π
- e

## Important Theorems

### Euclid's Division Lemma
For any two positive integers a and b, there exist unique integers q and r such that:
a = bq + r, where 0 ≤ r < b

### Fundamental Theorem of Arithmetic
Every composite number can be expressed as a product of primes, and this factorization is unique.`, // Backward compatibility
        keywords: ['real numbers', 'rational', 'irrational', 'euclid', 'prime'],
        difficulty: 'medium',
        estimatedTime: 45
      },
      {
        chapterTitle: 'Polynomials',
        subjectId: mathSubject._id,
        subject: mathSubject._id, // Backward compatibility
        title: 'Polynomials', // Backward compatibility
        chapterNumber: 2,
        chapterContent: `# Polynomials

## Introduction
A polynomial is an expression consisting of variables and coefficients.

## Degree of Polynomial
The highest power of the variable in a polynomial is called its degree.

## Types of Polynomials
- Linear (degree 1)
- Quadratic (degree 2)
- Cubic (degree 3)

## Zeroes of Polynomial
The values of x for which p(x) = 0 are called zeroes of the polynomial.`,
        content: `# Polynomials

## Introduction
A polynomial is an expression consisting of variables and coefficients.

## Degree of Polynomial
The highest power of the variable in a polynomial is called its degree.

## Types of Polynomials
- Linear (degree 1)
- Quadratic (degree 2)
- Cubic (degree 3)

## Zeroes of Polynomial
The values of x for which p(x) = 0 are called zeroes of the polynomial.`, // Backward compatibility
        keywords: ['polynomial', 'degree', 'zeroes', 'quadratic'],
        difficulty: 'easy',
        estimatedTime: 40
      },
      {
        chapterTitle: 'Chemical Reactions and Equations',
        subjectId: scienceSubject._id,
        subject: scienceSubject._id, // Backward compatibility
        title: 'Chemical Reactions and Equations', // Backward compatibility
        chapterNumber: 1,
        chapterContent: `# Chemical Reactions and Equations

## Introduction
A chemical reaction is a process where reactants are converted into products.

## Types of Chemical Reactions
1. Combination Reaction
2. Decomposition Reaction
3. Displacement Reaction
4. Double Displacement Reaction

## Balancing Chemical Equations
Chemical equations must be balanced to follow the law of conservation of mass.`,
        content: `# Chemical Reactions and Equations

## Introduction
A chemical reaction is a process where reactants are converted into products.

## Types of Chemical Reactions
1. Combination Reaction
2. Decomposition Reaction
3. Displacement Reaction
4. Double Displacement Reaction

## Balancing Chemical Equations
Chemical equations must be balanced to follow the law of conservation of mass.`, // Backward compatibility
        keywords: ['chemical reaction', 'equation', 'balancing', 'reactants', 'products'],
        difficulty: 'medium',
        estimatedTime: 50
      }
    ];

    // Insert chapters one by one to avoid SSL connection issues
    const createdChapters = [];
    for (const chapter of chapters) {
      try {
        const created = await Chapter.create(chapter);
        createdChapters.push(created);
      } catch (error) {
        console.error(`Error creating chapter ${chapter.chapterTitle}:`, error.message);
      }
    }
    console.log('✅ Created chapters');

    // Update subjects with chapters
    await Subject.findByIdAndUpdate(mathSubject._id, {
      chapters: createdChapters.filter(c => 
        (c.subjectId || c.subject)?.toString() === mathSubject._id.toString()
      ).map(c => c._id)
    });

    await Subject.findByIdAndUpdate(scienceSubject._id, {
      chapters: createdChapters.filter(c => 
        (c.subjectId || c.subject)?.toString() === scienceSubject._id.toString()
      ).map(c => c._id)
    });

    // Create sample quiz
    const realNumbersChapter = createdChapters.find(c => 
      (c.chapterTitle || c.title) === 'Real Numbers'
    );
    if (realNumbersChapter) {
      const quiz = await Quiz.create({
        title: 'Real Numbers Quiz',
        chapter: realNumbersChapter._id,
        subject: mathSubject._id,
        subjectId: mathSubject._id, // Backward compatibility
        questions: [
          {
            question: 'Which of the following is a rational number?',
            options: ['√2', 'π', '3/4', '√5'],
            correctAnswer: 2,
            explanation: '3/4 is a rational number as it can be expressed as a fraction.',
            points: 10
          },
          {
            question: 'What is the decimal expansion of 1/3?',
            options: ['Terminating', 'Non-terminating recurring', 'Non-terminating non-recurring', 'None of the above'],
            correctAnswer: 1,
            explanation: '1/3 = 0.333... which is non-terminating and recurring.',
            points: 10
          },
          {
            question: 'According to Euclid\'s Division Lemma, for a = 17 and b = 5, what is the remainder?',
            options: ['0', '1', '2', '3'],
            correctAnswer: 2,
            explanation: '17 = 5 × 3 + 2, so remainder is 2.',
            points: 10
          }
        ],
        timeLimit: 300,
        difficulty: 'medium'
      });

      await Chapter.findByIdAndUpdate(realNumbersChapter._id, { quiz: quiz._id });
      console.log('✅ Created sample quiz');
    }

    console.log('\n🎉 Seed data created successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@smarteducation.com / admin123');
    console.log('Student: vikas@example.com / student123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

