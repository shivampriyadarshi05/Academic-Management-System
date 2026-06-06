// Message.js — Mongoose Model for Chat Messages
// This model stores messages between students and teachers.
// The chatbox appears on the Student Dashboard only when
// the student is marked absent for today.

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Who sent the message (User ID)
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Role of the sender — "student" or "teacher"
  senderRole: {
    type: String,
    enum: ['student', 'teacher'],
    required: true,
  },

  // Who is the message for (User ID)
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // The actual message text
  text: {
    type: String,
    required: true,
    trim: true,
  },

  // When the message was sent
  timestamp: {
    type: Date,
    default: Date.now,
  },

  // Has the receiver read this message?
  isRead: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Message', messageSchema);
