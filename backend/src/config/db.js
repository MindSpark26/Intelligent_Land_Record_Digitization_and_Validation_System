const mongoose = require('mongoose');

/**
 * Connects to MongoDB using MONGODB_URI (falls back to a local instance).
 * Throws on failure so the caller can decide whether to fall back to the
 * in-memory store.
 */
async function connectDB() {
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
  console.log('[DB] Connected to MongoDB');
}

module.exports = connectDB;
