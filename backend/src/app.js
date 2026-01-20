const express = require('express'); 
const cors = require('cors'); 
const bodyParser = require('body-parser'); 

const { connectDB } = require('./config/database'); 
const logger = require('./config/logger'); 

const cookieParser = require('cookie-parser'); 

const healthRoutes = require('./routes/health'); 
const authRoutes = require('./routes/auth'); 
const teamRoutes = require('./routes/team'); 
const userRoutes = require('./routes/user'); 
const carSetupRoutes = require('./routes/carSetup'); 
const categoriesRoutes = require('./routes/categories');

const app = express(); 

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Application middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
  credentials: true 
}));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

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
app.use('/api/car-setup', carSetupRoutes);
app.use('/api/categories', categoriesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;