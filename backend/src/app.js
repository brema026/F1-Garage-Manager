const express = require('express'); // Import Express web framework
const cors = require('cors'); // Import CORS middleware for cross-origin requests
const bodyParser = require('body-parser'); // Import body parser for request parsing

const { connectDB } = require('./config/database'); // Import database connection function
const logger = require('./config/logger'); // Import Winston logger

const cookieParser = require('cookie-parser'); // Import cookie parser middleware

const healthRoutes = require('./routes/health'); // Import health check routes
const authRoutes = require('./routes/auth'); // Import authentication routes
const teamRoutes = require('./routes/team'); // Import team routes
const userRoutes = require('./routes/user'); // Import user routes
const partRoutes = require('./routes/part');
const categoryRoutes = require('./routes/category');
const inventoryRoutes = require('./routes/inventory');
const sponsorRoutes = require('./routes/sponsorRoutes');

const app = express(); // Initialize Express application

// Logging middleware - logs every incoming HTTP request
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Application middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3002', // Allow requests from frontend
  credentials: true // Allow cookies in cross-origin requests
}));
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Establish database connection
connectDB();

// Cookie parser middleware
app.use(cookieParser());

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'F1 Garage Manager - Backend API',
    version: '1.0.0'
  });
});

// Register routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/parts', partRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sponsors', sponsorRoutes);

// Error handling middleware - catches errors from routes and middlewares
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

// Export Express application for use in server.js
module.exports = app;