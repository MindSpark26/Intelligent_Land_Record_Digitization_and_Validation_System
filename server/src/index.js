require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Try MongoDB first, fall back to in-memory store
let useMongoose = false;

async function connectDB() {
  try {
    const mongoose = require('mongoose');
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/land_ai_platform';
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    useMongoose = true;
    console.log('[DB] Connected to MongoDB');
  } catch (err) {
    console.log('[DB] MongoDB not available, using in-memory store. (' + err.message + ')');
    useMongoose = false;
  }
}

async function startServer() {
  await connectDB();

  // Choose route handler based on DB availability
  if (useMongoose) {
    const documentRoutes = require('./routes/documents');
    app.use('/api', documentRoutes);
  } else {
    const memoryRoutes = require('./routes/documents-memory');
    app.use('/api', memoryRoutes);
  }

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', db: useMongoose ? 'mongodb' : 'in-memory', timestamp: new Date().toISOString() });
  });

  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
