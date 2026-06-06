// Attendance.js — Mongoose Model for Attendance
// Each document represents ONE student's attendance for ONE day.
// We use a compound index on (studentId + date) to prevent duplicates.
// The teacher uses "upsert" to either create or update the record.

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  // Reference to the student (links to the User collection)
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',       // this creates a relationship with the User model
    required: true,
  },

  // Student's name 
  studentName: {
    type: String,
    required: true,
  },


  // We use a String instead of Date to make comparisons simpler
  date: {
    type: String,
    required: true,
  },

  // "present" or "absent"
  status: {
    type: String,
    enum: ['present', 'absent'],
    required: true,
  },

  // Reference to the teacher who marked this attendance
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
