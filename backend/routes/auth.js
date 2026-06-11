// auth.js — Authentication Routes 


const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');       
const jwt = require('jsonwebtoken');   
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// ---------- GET ALL STUDENTS ----------
// GET /api/auth/students
// Returns all users with role "student" (used by Teacher & Parent dashboards)
router.get('/students', authMiddleware, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }, 'name email');
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error.message);
    res.status(500).json({ message: 'Failed to fetch students.' });
  }
});

// ---------- SIGNUP ROUTE ----------
// POST /api/auth/signup
// Body: { name, email, password, role }
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate that all fields are provided
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Hash the password before saving (10 = salt rounds)
    // Salt rounds determine how complex the hash is (10 is a good default)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });
    await newUser.save();

    // Create a JWT token that expires in 7 days
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role, name: newUser.name, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send success response with the token and user info
    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ message: 'Server error during signup. Please try again.' });
  }
});

// ---------- LOGIN ROUTE ----------
// POST /api/auth/login
// Body: { email, password }
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No account found with this email.' });
    }

    // Compare the provided password with the stored hash
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Incorrect password.' });
    }

    // Create a JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send success response
    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login. Please try again.' });
  }
});

module.exports = router;
