// attendance.js — Attendance Routes


const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


router.post('/mark', authMiddleware, async (req, res) => {
  try {
    const { studentId, studentName, date, status } = req.body;

    
    if (!studentId || !studentName || !date || !status) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    
    const attendance = await Attendance.findOneAndUpdate(
      { studentId, date },  
      { studentId, studentName, date, status, markedBy: req.user.userId }, 
      { upsert: true, new: true } 
    );

    if (status === 'absent') {
      // Find the student's email
      const student = await User.findById(studentId);
      if (student) {
        
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: '⚠️ Absence Alert — Academic Management System',
            html: `
              <h2>Absence Notification</h2>
              <p>Dear <strong>${studentName}</strong>,</p>
              <p>You have been marked <strong style="color: red;">ABSENT</strong> on <strong>${date}</strong>.</p>
              <p>If you believe this is an error, please contact your teacher.</p>
              <hr>
              <p><em>Academic Management System</em></p>
            `,
          });
        } catch (emailError) {
          console.error('Failed to send absence email:', emailError.message);
          
        }

        
        await checkAndSendThresholdAlert(studentId, studentName, student.email);
      }
    }

    res.json({ message: `Attendance marked: ${studentName} is ${status} on ${date}`, attendance });
  } catch (error) {
    console.error('Mark attendance error:', error.message);
    res.status(500).json({ message: 'Failed to mark attendance.' });
  }
});


async function checkAndSendThresholdAlert(studentId, studentName, studentEmail) {
  try {

    const totalDays = await Attendance.countDocuments({ studentId });
    const presentDays = await Attendance.countDocuments({ studentId, status: 'present' });
    const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 100;

    
    if (percentage < 75) {
     
      const student = await User.findById(studentId);
      const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

      if (student.lastAlertSent) {
        const lastAlert = new Date(student.lastAlertSent).toISOString().split('T')[0];
        if (lastAlert === today) {
          
          return;
        }
      }

      
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: studentEmail,
        subject: '🚨 Low Attendance Warning — Below 75%',
        html: `
          <h2>Low Attendance Warning</h2>
          <p>Dear <strong>${studentName}</strong>,</p>
          <p>Your current attendance is <strong style="color: red;">${percentage.toFixed(1)}%</strong>, which is below the required 75%.</p>
          <p>Please ensure regular attendance to avoid academic penalties.</p>
          <hr>
          <p><em>Academic Management System</em></p>
        `,
      });

      
      await User.findByIdAndUpdate(studentId, { lastAlertSent: new Date() });
    }
  } catch (error) {
    console.error('Threshold alert error:', error.message);
  }
}


router.get('/:date', authMiddleware, async (req, res) => {
  try {
    const { date } = req.params;
    const records = await Attendance.find({ date });
    res.json(records);
  } catch (error) {
    console.error('Get attendance error:', error.message);
    res.status(500).json({ message: 'Failed to fetch attendance.' });
  }
});



router.get('/percentage/:studentId', authMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params;

    const totalDays = await Attendance.countDocuments({ studentId });
    const presentDays = await Attendance.countDocuments({ studentId, status: 'present' });
    const absentDays = totalDays - presentDays;
    const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 100;

    res.json({
      totalDays,
      presentDays,
      absentDays,
      percentage: parseFloat(percentage.toFixed(1)),
    });
  } catch (error) {
    console.error('Attendance percentage error:', error.message);
    res.status(500).json({ message: 'Failed to calculate attendance percentage.' });
  }
});


router.get('/status/:studentId/:date', authMiddleware, async (req, res) => {
  try {
    const { studentId, date } = req.params;
    const record = await Attendance.findOne({ studentId, date });

    if (!record) {
      
      return res.json({ isAbsent: false, record: null });
    }

    res.json({
      isAbsent: record.status === 'absent',
      record,
    });
  } catch (error) {
    console.error('Attendance status error:', error.message);
    res.status(500).json({ message: 'Failed to check attendance status.' });
  }
});

module.exports = router;
