// ============================================
// report.js — PDF Report Generation Route
// ============================================
// GET /api/report/generate — Generate a semester report PDF
// Uses pdfkit to create a PDF and streams it directly to the response.

const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Attendance = require('../models/Attendance');
const Material = require('../models/Material');
const Timetable = require('../models/Timetable');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/report/generate
router.get('/generate', authMiddleware, async (req, res) => {
  try {
    // Fetch all data simultaneously using Promise.all for speed
    const [attendanceRecords, materials, timetableEntries, students] = await Promise.all([
      Attendance.find(),
      Material.find().populate('uploadedBy', 'name'),
      Timetable.find(),
      User.find({ role: 'student' }, 'name email'),
    ]);

    // Set response headers so the browser downloads a PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=semester_report.pdf');

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Pipe the PDF directly to the response (no file saved on disk)
    doc.pipe(res);

    // ---- SECTION 1: COVER PAGE ----
    doc.fontSize(26).text('Semester Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Total Students: ${students.length}`, { align: 'center' });
    doc.text(`Total Attendance Records: ${attendanceRecords.length}`, { align: 'center' });
    doc.text(`Total Materials Uploaded: ${materials.length}`, { align: 'center' });
    doc.text(`Total Timetable Entries: ${timetableEntries.length}`, { align: 'center' });

    // ---- SECTION 2: ATTENDANCE SUMMARY TABLE ----
    doc.addPage();
    doc.fontSize(18).text('Per-Student Attendance Summary', { underline: true });
    doc.moveDown();

    // Build summary for each student
    for (const student of students) {
      const studentRecords = attendanceRecords.filter(
        (r) => r.studentId.toString() === student._id.toString()
      );
      const total = studentRecords.length;
      const present = studentRecords.filter((r) => r.status === 'present').length;
      const absent = total - present;
      const pct = total > 0 ? ((present / total) * 100).toFixed(1) : 'N/A';

      doc.fontSize(11)
        .text(`${student.name} — Total: ${total}, Present: ${present}, Absent: ${absent}, Percentage: ${pct}%`);
      doc.moveDown(0.3);
    }

    // ---- SECTION 3: UPLOADED MATERIALS LIST ----
    doc.addPage();
    doc.fontSize(18).text('Uploaded Materials & Assignments', { underline: true });
    doc.moveDown();

    if (materials.length === 0) {
      doc.fontSize(11).text('No materials uploaded yet.');
    } else {
      for (const mat of materials) {
        const teacher = mat.uploadedBy ? mat.uploadedBy.name : 'Unknown';
        doc.fontSize(11)
          .text(`• ${mat.fileName} [${mat.category}] — Uploaded by ${teacher} on ${new Date(mat.uploadDate).toLocaleDateString()}`);
        doc.moveDown(0.3);
      }
    }

    // ---- SECTION 4: DATE-WISE ATTENDANCE ----
    doc.addPage();
    doc.fontSize(18).text('Date-wise Attendance Records', { underline: true });
    doc.moveDown();

    // Group attendance by date
    const dateMap = {};
    for (const rec of attendanceRecords) {
      if (!dateMap[rec.date]) dateMap[rec.date] = [];
      dateMap[rec.date].push(rec);
    }

    const sortedDates = Object.keys(dateMap).sort();
    for (const date of sortedDates) {
      doc.fontSize(12).text(`Date: ${date}`, { underline: true });
      for (const rec of dateMap[date]) {
        const statusColor = rec.status === 'present' ? 'green' : 'red';
        doc.fontSize(10).fillColor(statusColor)
          .text(`  ${rec.studentName}: ${rec.status}`);
      }
      doc.fillColor('black').moveDown(0.5);
    }

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error('Report generation error:', error.message);
    res.status(500).json({ message: 'Failed to generate report.' });
  }
});

module.exports = router;
