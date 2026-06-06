// Material.js — Mongoose Model for Uploaded Files
// When a teacher uploads a file (lesson plan, study material, assignment),
// the file itself goes to the /uploads folder on disk,
// and this model stores the METADATA about that file in MongoDB.

const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  // Original name of the uploaded file
  fileName: {
    type: String,
    required: true,
  },

  // Path where the file is stored on the server (e.g., "uploads/1234567890-notes.pdf")
  filePath: {
    type: String,
    required: true,
  },

  // Category of the file — helps students filter/search
  category: {
    type: String,
    enum: ['Lesson Plan', 'Study Material', 'Assignment'],
    required: true,
  },

  // When the file was uploaded
  uploadDate: {
    type: Date,
    default: Date.now,
  },

  // Reference to the teacher who uploaded the file
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Material', materialSchema);
