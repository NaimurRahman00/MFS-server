const db = require('../utils/db');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const usersCollection = db.get().collection('users');
    const users = await usersCollection.find().toArray();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const usersCollection = db.get().collection('users');
    const user = await usersCollection.findOne({ _id: db.ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update user
const updateUser = async (req, res) => {
  const userId = req.params.id;
  const updates = req.body;

  try {
    const usersCollection = db.get().collection('users');
    const result = await usersCollection.updateOne({ _id: db.ObjectId(userId) }, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser
};

