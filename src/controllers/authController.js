const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../utils/db');

// Register new user
const register = async (req, res) => {
  const { name, pin, mobileNumber, email } = req.body;

  try {
    const usersCollection = db.get().collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash PIN
    const hashedPin = await bcrypt.hash(pin.toString(), 10);

    // Create new user object
    const newUser = {
      name,
      pin: hashedPin,
      mobileNumber,
      email,
      status: 'pending' // Pending admin approval
    };

    // Insert user into database
    await usersCollection.insertOne(newUser);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Login user
const login = async (req, res) => {
  const { email, pin } = req.body;

  try {
    const usersCollection = db.get().collection('users');

    // Find user by email
    const user = await usersCollection.findOne({ email, status: 'approved' });

    if (!user) {
      return res.status(404).json({ message: 'User not found or account not approved' });
    }

    // Compare PIN
    const isMatch = await bcrypt.compare(pin.toString(), user.pin);

    if (!isMatch) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  register,
  login
};
