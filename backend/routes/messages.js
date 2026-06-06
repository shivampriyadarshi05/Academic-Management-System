// messages.js — Chat Message Routes
// POST /api/messages               — Send a new message
// GET  /api/messages/:studentId    — Get all messages between a student and teachers
// GET  /api/messages/conversations/teacher — Get all students who sent messages (for teacher panel)
//
// Messages are between students (who are absent) and teachers.

const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// ---------- SEND A MESSAGE ----------
// POST /api/messages
// Body: { receiverId, text }
router.post('/', authMiddleware, async (req, res) => {
  try {
    let { receiverId, text } = req.body;

    if (!receiverId || !text) {
      return res.status(400).json({ message: 'Receiver ID and message text are required.' });
    }

    // If the student sends a message to "teacher" (string), find an actual teacher
    // This handles the case where the student doesn't know the teacher's MongoDB ID
    if (receiverId === 'teacher') {
      const teacher = await User.findOne({ role: 'teacher' });
      if (!teacher) {
        return res.status(400).json({ message: 'No teacher found in the system.' });
      }
      receiverId = teacher._id;
    }

    // Create and save the message
    const message = new Message({
      senderId: req.user.userId,
      senderRole: req.user.role,
      receiverId,
      text,
    });
    await message.save();

    res.status(201).json({ message: 'Message sent!', data: message });
  } catch (error) {
    console.error('Send message error:', error.message);
    res.status(500).json({ message: 'Failed to send message.' });
  }
});

// ---------- GET MESSAGES FOR A STUDENT ----------
// GET /api/messages/:studentId
// Returns all messages between this student and any teacher, sorted by time
router.get('/:studentId', authMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Find messages where the student is either sender or receiver
    const messages = await Message.find({
      $or: [
        { senderId: studentId },
        { receiverId: studentId },
      ],
    }).sort({ timestamp: 1 }); // oldest first (ascending)

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error.message);
    res.status(500).json({ message: 'Failed to fetch messages.' });
  }
});

// ---------- GET ALL CONVERSATIONS FOR TEACHER ----------
// GET /api/messages/conversations/teacher
// Returns a list of unique students who have sent messages
router.get('/conversations/teacher', authMiddleware, async (req, res) => {
  try {
    // Find all unique student IDs who sent messages
    const studentIds = await Message.distinct('senderId', { senderRole: 'student' });

    // Get student details
    const students = await User.find(
      { _id: { $in: studentIds } },
      'name email' // only return name and email
    );

    // For each student, get the latest message
    const conversations = await Promise.all(
      students.map(async (student) => {
        const latestMessage = await Message.findOne({
          $or: [
            { senderId: student._id },
            { receiverId: student._id },
          ],
        }).sort({ timestamp: -1 }); // get the newest message

        // Count unread messages from this student
        const unreadCount = await Message.countDocuments({
          senderId: student._id,
          senderRole: 'student',
          isRead: false,
        });

        return {
          student: { id: student._id, name: student.name, email: student.email },
          latestMessage: latestMessage ? latestMessage.text : '',
          latestTime: latestMessage ? latestMessage.timestamp : null,
          unreadCount,
        };
      })
    );

    // Sort by latest message time (newest first)
    conversations.sort((a, b) => new Date(b.latestTime) - new Date(a.latestTime));

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error.message);
    res.status(500).json({ message: 'Failed to fetch conversations.' });
  }
});

module.exports = router;
