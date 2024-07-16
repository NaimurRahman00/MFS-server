const express = require('express');
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



// User Registration
router.post('/register', async (req, res) => {
  const db = req.app.locals.db;
  const usersCollection = db.collection('users');
  const { name, pin, mobileNumber, email } = req.body;

  try {
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Insert new user
    const newUser = { name, pin, mobileNumber, email, status: 'Pending' };
    await usersCollection.insertOne(newUser);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  const db = req.app.locals.db;
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

module.exports = router;
