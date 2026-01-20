const app = require('./src/app'); // Import Express application
const { closeDB } = require('./src/config/database'); // Import database connection close function
const logger = require('./src/config/logger'); // Import Winston logger

// Get port from environment variables or use default
const PORT = process.env.PORT || 3001;

// Start Express server and listen on specified port
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  logger.info(`Server running on port ${PORT}`);
});

// Handle graceful shutdown on SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
  logger.info('Shutting down server...');
  await closeDB(); // Close database connection properly
  process.exit(0); // Exit process with success code
});