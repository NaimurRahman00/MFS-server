const express = require('express');
const { getDb } = require('../utils/db'); // Import your database connection
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send('Access denied');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
};

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  const db = getDb();
  const usersCollection = db.collection('users');
  const { username } = req.user;

  try {
    const user = await usersCollection.findOne({ username });
    if (!user) return res.status(404).send('User not found');

    // Exclude password from the response
    const { password, ...userData } = user;
    res.json(userData);
  } catch (error) {
    res.status(500).send('Error fetching user profile');
  }
});

// Register new user
router.post('/users', async (req, res) => {
  const db = getDb();
  const usersCollection = db.collection('users');
  const { name, pin, mobileNumber, email, role, status } = req.body;

  try {
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User with this email already exists');
    }

    const newUser = {
      name,
      pin,
      mobileNumber,
      email,
      role,
      status,
    };

    await usersCollection.insertOne(newUser);
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(500).send('Error registering user');
  }
});

module.exports = router;
