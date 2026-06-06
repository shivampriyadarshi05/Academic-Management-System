// ============================================
// server.js — Main Entry Point for the Backend
// ============================================
// This file does 4 things:
// 1. Loads environment variables from .env
// 2. Connects to MongoDB Atlas
// 3. Sets up Express middleware (CORS, JSON parsing, static files)
// 4. Registers all API routes and starts the server

// ---------- IMPORTS ----------

// dotenv: loads variables from .env file into process.env
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');       // Web framework for Node.js
const mongoose = require('mongoose');     // MongoDB ODM (Object Data Modeling)
const cors = require('cors');             // Allows frontend (port 5173) to talk to backend (port 5000)
const path = require('path');             // Node.js utility for file paths
const dns = require('dns');               // DNS module to fix SRV resolution issues

// Fix for ISPs that block MongoDB Atlas SRV DNS records
// Forces Node.js to use Google's public DNS servers instead of your ISP's DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

// ---------- CREATE EXPRESS APP ----------
const app = express();

// ---------- MIDDLEWARE ----------

// Enable CORS so the React frontend can make requests to this backend
app.use(cors());

// Parse incoming JSON request bodies (e.g., from POST requests)
app.use(express.json());

// Serve uploaded files as static files
// When someone visits http://localhost:5000/uploads/somefile.pdf, Express serves it
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- IMPORT ROUTES ----------

const authRoutes       = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const uploadRoutes     = require('./routes/upload');
const messageRoutes    = require('./routes/messages');
const timetableRoutes  = require('./routes/timetable');
const reportRoutes     = require('./routes/report');

// ---------- REGISTER ROUTES ----------
// Each route file handles a specific feature
// Example: POST /api/auth/signup is handled by authRoutes

app.use('/api/auth', authRoutes);             // Signup & Login
app.use('/api/attendance', attendanceRoutes); // Mark & view attendance
app.use('/api/upload', uploadRoutes);         // File uploads
app.use('/api/messages', messageRoutes);      // Chat messages
app.use('/api/timetable', timetableRoutes);   // Timetable management
app.use('/api/report', reportRoutes);         // PDF report generation

// ---------- SIMPLE TEST ROUTE ----------
// Visit http://localhost:5000/ to check if the server is running
app.get('/', (req, res) => {
  res.json({ message: 'Academic Management API is running!' });
});

// ---------- CONNECT TO MONGODB & START SERVER ----------

const PORT = process.env.PORT || 5000;

// Log the connection attempt (mask password for security)
const mongoUri = process.env.MONGO_URI;
const maskedUri = mongoUri ? mongoUri.replace(/:([^@]+)@/, ':****@') : 'NOT SET';
console.log('📡 Attempting to connect to MongoDB...');
console.log('   URI:', maskedUri);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('');
    console.error('💡 Common fixes:');
    console.error('   1. Go to MongoDB Atlas → Network Access → Add your IP (or 0.0.0.0/0)');
    console.error('   2. Check that your cluster name is correct in the connection string');
    console.error('   3. Make sure your MongoDB Atlas cluster is active (not paused)');
    console.error('   4. Check your internet connection');
  });
