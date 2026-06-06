// upload.js — File Upload Routes
// POST /api/upload     — Teacher uploads a file (PDF/document)
// GET  /api/upload      — Get list of all uploaded files
// Uses Multer to handle file uploads.
// Files are saved to the /uploads folder on the server.
// Only PDFs and document formats are allowed.

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Material = require('../models/Material');
const authMiddleware = require('../middleware/authMiddleware');

// ---------- MULTER CONFIGURATION ----------

// Configure where and how files are stored
const storage = multer.diskStorage({
  // destination: which folder to save uploaded files
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  // filename: how to name the saved file
  // We add a timestamp prefix to avoid name collisions
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

// fileFilter: only allow certain file types
const fileFilter = (req, file, cb) => {
  // List of allowed MIME types
  const allowedTypes = [
    'application/pdf',                                                    // .pdf
    'application/msword',                                                 // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-powerpoint',                                     // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'text/plain',                                                        // .txt
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);  // Accept the file
  } else {
    cb(new Error('Only PDF and document files are allowed!'), false); // Reject the file
  }
};

// Create the multer upload handler
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max file size: 10MB
});

// ---------- UPLOAD FILE ----------
// POST /api/upload
// Form data: file (the actual file) + category (dropdown value)
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or file type not allowed.' });
    }

    const { category } = req.body;

    if (!category) {
      return res.status(400).json({ message: 'Category is required.' });
    }

    // Save file metadata to MongoDB
    const material = new Material({
      fileName: req.file.originalname,
      filePath: `uploads/${req.file.filename}`,
      category,
      uploadedBy: req.user.userId,
    });
    await material.save();

    res.status(201).json({
      message: 'File uploaded successfully!',
      material,
    });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to upload file.' });
  }
});

// ---------- GET ALL UPLOADED FILES ----------
// GET /api/upload
// Returns all uploaded materials, sorted newest first
router.get('/', authMiddleware, async (req, res) => {
  try {
    const materials = await Material.find()
      .sort({ uploadDate: -1 })         // newest first
      .populate('uploadedBy', 'name');   // include teacher's name
    res.json(materials);
  } catch (error) {
    console.error('Get materials error:', error.message);
    res.status(500).json({ message: 'Failed to fetch materials.' });
  }
});

module.exports = router;
