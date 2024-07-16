const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getDb } = require('../utils/db'); // Import your database connection

const router = express.Router();

// Register endpoint
router.post('/users', async (req, res) => {
  const { username, password } = req.body;
  const db = getDb();
  const usersCollection = db.collection('users');

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await usersCollection.insertOne({ username, password: hashedPassword });
    res.status(201).send('User registered!');
  } catch (error) {
    res.status(500).send('Error registering user');
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const db = getDb();
  // const usersCollection = db.collection('users');
  const usersCollection = client.db('MFS').collection('users')

  try {
    const user = await usersCollection.findOne({ username });
    if (!user) return res.status(400).send('User not found');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).send('Invalid password');

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).send('Error logging in');
  }
});

module.exports = router;
