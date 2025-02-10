const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const usersRouter = require('./routers/users');
const hospitalRouter = require('./routers/hospitals');
const agentsRouter = require('./routers/agents');
const authRouter = require('./routers/auth');
const paymentRouter = require('./routers/payment');
const recordsRouter = require('./routers/records');
const mobileRouter = require('./routers/mobile');
const emailsRouter = require('./routers/emails');
const paymentsRouter = require('./routers/payments');
const challengeRoutes = require('./routers/challenges');
require('dotenv').config();

const allowedOrigins = [
    'http://healthkard.in',
    'http://www.healthkard.in',
    'https://healthkard.in',
    'https://www.healthkard.in',
    'https://backend-green-tau.vercel.app',
    'http://localhost:3000',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3002',
    'http://localhost:5000',
    'http://127.0.0.1:5000'
];

// Logging middleware for debugging
app.use((req, res, next) => {
    console.log('Incoming request from origin:', req.headers.origin);
    next();
});

// CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        console.log('Request origin:', origin);
        // Remove trailing slash if present
        const cleanOrigin = origin ? origin.replace(/\/$/, '') : origin;
        if (!cleanOrigin || allowedOrigins.includes(cleanOrigin)) {
            callback(null, true);
        } else {
            console.log('Origin not allowed:', cleanOrigin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    exposedHeaders: ['Access-Control-Allow-Origin'],
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Add a pre-flight route handler
app.options('*', cors(corsOptions));

// General middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('Database Connected'))
    .catch(err => console.log('Database Connection Error:', err));

// Routes
app.get('/', (req, res) => { 
    res.status(200).send('Server is running'); 
});

app.use('/users', usersRouter);
app.use('/hospitals', hospitalRouter);
app.use('/agents', agentsRouter);
app.use('/auth', authRouter);
app.use('/pay', paymentRouter);
app.use('/records', recordsRouter);
app.use('/payments', paymentsRouter);
app.use('/mobile', mobileRouter);
app.use('/emails', emailsRouter);
app.use('/api/challenges', challengeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;