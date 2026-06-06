// User.js — Mongoose Model for Users
// This model stores information about every user (Teacher, Student, or Parent).

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // User's full name
  name: {
    type: String,
    required: true,
    trim: true, // removes extra spaces from start/end
  },

  // User's email — must be unique (no two users with same email)
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true, // store emails in lowercase to avoid duplicates
  },

  password: {
    type: String,
    required: true,
  },

  // Role determines which dashboard the user sees
  role: {
    type: String,
    enum: ['teacher', 'student', 'parent'], 
    required: true,
  },

  // Date when attendance alert was last sent
  lastAlertSent: {
    type: Date,
    default: null,
  },
}, {
  
  timestamps: true,
});


module.exports = mongoose.model('User', userSchema);
