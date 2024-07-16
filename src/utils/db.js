const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@cluster0.lt2wcqp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri);

let db;

const connectDB = async () => {
  try {
    // await client.connect();
    db = client.db(process.env.DB_NAME); // Add your database name in .env
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

const getDb = () => db;

module.exports = { connectDB, getDb };
