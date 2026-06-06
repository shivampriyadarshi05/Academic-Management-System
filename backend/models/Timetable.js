// Timetable.js — Mongoose Model for Timetable Entries


const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  // Day of the week
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    required: true,
  },

  // Time slot 
  timeSlot: {
    type: String,
    required: true,
  },

  // Subject name 
  subject: {
    type: String,
    required: true,
    trim: true,
  },

  // Classroom / room number 
  classroom: {
    type: String,
    required: true,
    trim: true,
  },

  // Reference to the teacher who created this entry
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Semester identifier 
  semester: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Timetable', timetableSchema);
