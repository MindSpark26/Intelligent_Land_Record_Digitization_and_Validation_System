require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function startServer() {
  // Try MongoDB first, fall back to in-memory store
  let useMongoose = false;
  try {
    await connectDB();
    useMongoose = true;
  } catch (err) {
    console.log('[DB] MongoDB not available, using in-memory store. (' + err.message + ')');
  }

  // Choose route handler based on DB availability
  const documentRoutes = useMongoose
    ? require('./routes/documents')
    : require('./routes/documents-memory');
  app.use('/api', documentRoutes);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', db: useMongoose ? 'mongodb' : 'in-memory', timestamp: new Date().toISOString() });
  });

  // 404 + centralized error handling (registered last)
  app.use(notFound);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
