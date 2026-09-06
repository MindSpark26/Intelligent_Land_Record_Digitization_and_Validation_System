require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Try MongoDB first, fall back to in-memory store
let useMongoose = false;

async function connectDB() {
  try {
    const mongoose = require('mongoose');
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/land_ai_platform';

    // Warn if URI might be missing an explicit database name
    try {
      const url = new URL(MONGODB_URI.replace('mongodb+srv://', 'https://').replace('mongodb://', 'https://'));
      const dbPath = url.pathname;
      if (!dbPath || dbPath === '/' || dbPath === '') {
        console.warn('[DB WARNING] MONGODB_URI has no explicit database name. Documents may go to the default "test" database. Add a name like /land_ai_platform before the query string.');
      } else {
        console.log(`[DB] Target database: "${dbPath.replace('/', '')}"`);
      }
    } catch (_) {
      // URL parsing failed — non-critical, proceed with connection
    }

    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
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
