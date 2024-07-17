// Import required modules
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
};
app.use(cors(corsOptions));
app.use(express.json());
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

// Middleware for authenticating JWT
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(403).send({ message: 'Token is required' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Connect to MongoDB and start the server
async function connectAndStartServer() {
    try {
        await client.connect();
        console.log("Connected to MongoDB successfully!");

        app.get('/', (req, res) => {
            res.send('The server is running');
        });

        const usersCollection = client.db('MFS').collection('users');

        // Register endpoint
        app.post('/users', async (req, res) => {
            const { name, pin, mobileNumber, email, role, status } = req.body;

            try {
                // Hash the PIN
                const salt = await bcrypt.genSalt(10);
                const hashedPin = await bcrypt.hash(pin, salt);

                // Check if user already exists
                const existingUser = await usersCollection.findOne({ email });
                if (existingUser) {
                    return res.status(400).send({ message: 'User already exists' });
                }

                const userData = {
                    name,
                    pin: hashedPin,
                    mobileNumber,
                    email,
                    role,
                    status
                };

                const jwtData = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '1h' });

                await usersCollection.insertOne({ jwtData });
                res.status(201).send({ message: 'User registered successfully' });
            } catch (error) {
                console.error("Error registering user:", error);
                res.status(500).send({ message: 'Error registering user' });
            }
        });


        // Login endpoint
        app.post('/login', async (req, res) => {
            const { username, password } = req.body;

            try {
                const user = await usersCollection.findOne({ username });
                if (!user) return res.status(400).send({ message: 'User not found' });

                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) return res.status(400).send({ message: 'Invalid password' });

                const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.json({ token });
            } catch (error) {
                console.error("Error logging in user:", error);
                res.status(500).send({ message: 'Error logging in user' });
            }
        });

        // Get all users data from db (for admin or authorized users)
        app.get('/users', async (req, res) => {
            try {
                const result = await usersCollection.find().toArray();
                res.send(result);
            } catch (error) {
                console.error("Error fetching all users:", error);
                res.status(500).send({ message: 'Error fetching users' });
            }
        });

        // Get user by email (for admin or authorized users)
        app.get('/users/:email', authenticateJWT, async (req, res) => {
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
