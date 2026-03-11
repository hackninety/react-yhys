import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'yhys_calendar',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Optional: Check DB connection
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database connection failed:', error);
    // Still return 200 for "Service is up", but maybe indicate DB issue?
    // Or return 503 if DB is critical. For now, let's return 200 but with info, 
    // unless the app is strictly unusable without DB.
    res.status(200).json({ status: 'ok', database: 'disconnected', error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
