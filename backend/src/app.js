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
const cirucuitRoutes = require('./routes/circuits')

const app = express(); // Initialize Express application

// Logging middleware - logs every incoming HTTP request
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Application middlewares
// Application middlewares
app.use(cors({
  origin: function (origin, callback) {
    // Permitir Postman/curl/requests sin Origin
    if (!origin) return callback(null, true);

    try {
      const url = new URL(origin);

      const hostname = url.hostname; // ej: localhost, 192.168.1.40
      const port = url.port || (url.protocol === 'https:' ? '443' : '80');

      // ✅ Puerto permitido del frontend (ajusta si usas otro)
      const FRONTEND_PORT = '3002';

      // ✅ Solo hosts de red local (LAN)
      const isLocalHost =
        hostname === 'localhost' ||
        hostname === '127.0.0.1';

      const isPrivateIp =
        /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||                  // 192.168.x.x
        /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||               // 10.x.x.x
        /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname);    // 172.16–31.x.x

      // ✅ Permite localhost o IP privada + puerto correcto
      if ((isLocalHost || isPrivateIp) && port === FRONTEND_PORT) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    } catch (e) {
      return callback(new Error(`Invalid Origin: ${origin}`));
    }
  },
  credentials: true
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
app.use('/api/circuits', cirucuitRoutes);

// Error handling middleware - catches errors from routes and middlewares
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

// Export Express application for use in server.js
module.exports = app;