// Import required modules
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
const corsOptions = {
    origin: ["http://localhost:5173"],
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection URI
const uri = process.env.MONGODB_URI || `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lt2wcqp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Connect to MongoDB and start the server
async function connectAndStartServer() {
    try {
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        app.get('/', (req, res) => {
            res.send('The server is running')
        })

        const usersCollection = client.db('MFS').collection('users');

        // Get all users data from db
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        });

        // users
        app.post('/users', async (req, res) => {
            const usersData = req.body;
            const result = await usersCollection.insertOne(usersData);
            res.send(result)
        })

        // Get user by email
        app.get('/users/:email', async (req, res) => {
            const { email } = req.params;
            try {
                const user = await usersCollection.findOne({ email });
                if (!user) {
                    return res.status(404).send({ message: 'User not found' });
                }
                res.json(user);
            } catch (error) {
                console.error("Error fetching user by email:", error);
                res.status(500).send({ message: 'Error fetching user' });
            }
        });

        // Initialize routes
        app.use('/api/auth', authRoutes);
        app.use('/users', userRoutes);
        app.use('/api/transactions', transactionRoutes);

        // Start server
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
}

// Run the connection function
connectAndStartServer();

// Close MongoDB connection on process termination
// process.on('SIGINT', async () => {
//   await client.close();
//   console.log('MongoDB connection closed');
//   process.exit();
// });