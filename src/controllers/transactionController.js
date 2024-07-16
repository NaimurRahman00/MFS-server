const db = require('../utils/db');

// Send money
const sendMoney = async (req, res) => {
  const { senderId, receiverId, amount, pin } = req.body;

  try {
    const usersCollection = db.get().collection('users');
    const sender = await usersCollection.findOne({ _id: db.ObjectId(senderId) });

    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Verify PIN
    const isMatch = await bcrypt.compare(pin.toString(), sender.pin);

    if (!isMatch) {
      return res.status(401).json({ message: 'PIN verification failed' });
    }

    // Perform transaction logic here
    // Assume deducting amount from sender and adding to receiver
    // Update balances and transaction records

    res.status(200).json({ message: 'Money sent successfully' });
  } catch (error) {
    console.error('Error sending money:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Cash out
const cashOut = async (req, res) => {
  const { userId, agentId, amount, pin } = req.body;

  try {
    const usersCollection = db.get().collection('users');
    const user = await usersCollection.findOne({ _id: db.ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify PIN
    const isMatch = await bcrypt.compare(pin.toString(), user.pin);

    if (!isMatch) {
      return res.status(401).json({ message: 'PIN verification failed' });
    }

    // Perform cash out logic here
    // Assume deducting amount from user and adding to agent
    // Update balances and transaction records

    res.status(200).json({ message: 'Cash out successful' });
  } catch (error) {
    console.error('Error cashing out:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Cash in
const cashIn = async (req, res) => {
  const { userId, agentId, amount } = req.body;

  try {
    const usersCollection = db.get().collection('users');
    const agent = await usersCollection.findOne({ _id: db.ObjectId(agentId) });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Perform cash in logic here
    // Assume adding amount to user and deducting from agent
    // Update balances and transaction records

    res.status(200).json({ message: 'Cash in successful' });
  } catch (error) {
    console.error('Error cashing in:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Balance inquiry
const balanceInquiry = async (req, res) => {
  const userId = req.params.id;

  try {
    const usersCollection = db.get().collection('users');
    const user = await usersCollection.findOne({ _id: db.ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ balance: user.balance });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Transaction history
const transactionHistory = async (req, res) => {
  const userId = req.params.id;

  try {
    const transactionsCollection = db.get().collection('transactions');
    const transactions = await transactionsCollection.find({ userId }).limit(10).toArray();

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  sendMoney,
  cashOut,
  cashIn,
  balanceInquiry,
  transactionHistory
};
