const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/chapters', require('./routes/chapters'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/subscription', require('./routes/subscription'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Connect to MongoDB
const mongoOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 1,
  retryWrites: true,
  retryReads: true,
  // Reduce connection pool to avoid SSL issues
  maxIdleTimeMS: 30000,
  heartbeatFrequencyMS: 10000
};

// For MongoDB Atlas (mongodb+srv), add SSL options
if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb+srv')) {
  mongoOptions.tls = true;
  // Allow invalid certificates as workaround for SSL issues
  mongoOptions.tlsAllowInvalidCertificates = true;
  mongoOptions.tlsAllowInvalidHostnames = true;
}

// Track connection attempts
let connectionAttempts = 0;
const maxAttempts = 5;

// Connect with retry logic
const connectDB = async () => {
  connectionAttempts++;
  
  try {
    // Close existing connection if any
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_education', mongoOptions);
    console.log('✅ MongoDB connected successfully');
    connectionAttempts = 0; // Reset on success
  } catch (error) {
    console.error(`❌ MongoDB connection error (attempt ${connectionAttempts}/${maxAttempts}):`, error.message);
    
    // Only retry if we haven't exceeded max attempts
    if (connectionAttempts < maxAttempts) {
      const retryDelay = Math.min(5000 * connectionAttempts, 30000); // Exponential backoff, max 30s
      console.log(`⏳ Retrying connection in ${retryDelay / 1000} seconds...`);
      setTimeout(connectDB, retryDelay);
    } else {
      console.error('❌ Max connection attempts reached. Please check your MongoDB connection string and network.');
      console.error('💡 Tip: Ensure your IP is whitelisted in MongoDB Atlas and the connection string is correct.');
    }
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 MongoDB connection closed through app termination');
  process.exit(0);
});

connectDB();

const PORT = process.env.PORT || 5000;
let currentPort = PORT;
let attemptCount = 0;
const maxPortAttempts = 3;

const startServer = () => {
  attemptCount++;
  
  const server = app.listen(currentPort, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${currentPort}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (attemptCount < maxPortAttempts) {
        currentPort = parseInt(PORT) + attemptCount;
        console.error(`❌ Port ${PORT} is already in use. Trying port ${currentPort}...`);
        setTimeout(startServer, 1000);
      } else {
        console.error(`❌ Could not find an available port. Please kill processes using ports ${PORT}-${parseInt(PORT) + maxPortAttempts - 1}`);
        process.exit(1);
      }
    } else {
      throw err;
    }
  });
};

startServer();

