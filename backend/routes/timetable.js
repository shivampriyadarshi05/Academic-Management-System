// ============================================
// timetable.js — Timetable Routes
// ============================================
const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/timetable — Add entry
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { day, timeSlot, subject, classroom, semester } = req.body;
    if (!day || !timeSlot || !subject || !classroom || !semester) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const entry = new Timetable({ day, timeSlot, subject, classroom, teacherId: req.user.userId, semester });
    await entry.save();
    res.status(201).json({ message: 'Timetable entry added!', entry });
  } catch (error) {
    console.error('Add timetable error:', error.message);
    res.status(500).json({ message: 'Failed to add timetable entry.' });
  }
});

// GET /api/timetable — Get all entries
router.get('/', authMiddleware, async (req, res) => {
  try {
    const entries = await Timetable.find().populate('teacherId', 'name').sort({ day: 1, timeSlot: 1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch timetable.' });
  }
});

// DELETE /api/timetable/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Timetable.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Entry not found.' });
    res.json({ message: 'Timetable entry deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete entry.' });
  }
});

module.exports = router;
