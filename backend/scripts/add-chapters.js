const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Chapter = require('../models/Chapter');
const Subject = require('../models/Subject');

dotenv.config();

const addChapters = async () => {
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

    // Retry connection up to 3 times
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

    const mathSubject = await Subject.findOne({ name: 'Mathematics' });
    const scienceSubject = await Subject.findOne({ name: 'Science' });

    if (!mathSubject || !scienceSubject) {
      console.error('❌ Subjects not found. Please run seed script first.');
      process.exit(1);
    }

    console.log('Adding chapters...\n');

    // Clear existing chapters for these subjects
    await Chapter.deleteMany({
      $or: [
        { subjectId: mathSubject._id },
        { subject: mathSubject._id },
        { subjectId: scienceSubject._id },
        { subject: scienceSubject._id }
      ]
    });

    const chapters = [
      {
        chapterTitle: 'Real Numbers',
        subjectId: mathSubject._id,
        subject: mathSubject._id,
        title: 'Real Numbers',
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
Every composite number can be expressed as a product of primes, and this factorization is unique.`,
        keywords: ['real numbers', 'rational', 'irrational', 'euclid', 'prime'],
        difficulty: 'medium',
        estimatedTime: 45
      },
      {
        chapterTitle: 'Polynomials',
        subjectId: mathSubject._id,
        subject: mathSubject._id,
        title: 'Polynomials',
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
The values of x for which p(x) = 0 are called zeroes of the polynomial.`,
        keywords: ['polynomial', 'degree', 'zeroes', 'quadratic'],
        difficulty: 'easy',
        estimatedTime: 40
      },
      {
        chapterTitle: 'Chemical Reactions and Equations',
        subjectId: scienceSubject._id,
        subject: scienceSubject._id,
        title: 'Chemical Reactions and Equations',
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
Chemical equations must be balanced to follow the law of conservation of mass.`,
        keywords: ['chemical reaction', 'equation', 'balancing', 'reactants', 'products'],
        difficulty: 'medium',
        estimatedTime: 50
      }
    ];

    // Insert chapters with retry logic
    for (const chapter of chapters) {
      let created = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const result = await Chapter.create(chapter);
          console.log(`✅ Created: ${result.chapterTitle}`);
          created = true;
          // Small delay to avoid connection issues
          await new Promise(resolve => setTimeout(resolve, 1000));
          break;
        } catch (error) {
          if (attempt < 2) {
            console.log(`  Retrying ${chapter.chapterTitle}... (attempt ${attempt + 2})`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            console.error(`❌ Error creating ${chapter.chapterTitle}:`, error.message);
          }
        }
      }
    }

    // Update subject chapter arrays
    const mathChapters = await Chapter.find({
      $or: [
        { subjectId: mathSubject._id },
        { subject: mathSubject._id }
      ]
    });
    
    const scienceChapters = await Chapter.find({
      $or: [
        { subjectId: scienceSubject._id },
        { subject: scienceSubject._id }
      ]
    });

    await Subject.findByIdAndUpdate(mathSubject._id, {
      chapters: mathChapters.map(c => c._id)
    });

    await Subject.findByIdAndUpdate(scienceSubject._id, {
      chapters: scienceChapters.map(c => c._id)
    });

    console.log('\n✅ Chapters added successfully!');
    console.log(`Mathematics: ${mathChapters.length} chapters`);
    console.log(`Science: ${scienceChapters.length} chapters`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addChapters();

