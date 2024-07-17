const express = require('express');
const { getDb } = require('../utils/db'); // Import your database connection

const router = express.Router();

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

// Check if user exists
router.get('/users', async (req, res) => {
  const { email } = req.query;
  try {
    const user = await usersCollection.findOne({ email });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).send('Error checking user existence');
  }
});

module.exports = router;
