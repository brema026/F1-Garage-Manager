const winston = require('winston'); // Import winston logging library

// Logs to console with timestamp and log level
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info', // Log level from environment variable or default to 'info'
    
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Timestamp format
        winston.format.errors({ stack: true }), // Include stack trace in error logs
        winston.format.splat(), // String interpolation
        winston.format.json() // Log in JSON format
    ),
    
    // Define log transports
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(), // Colorize log levels for console
                winston.format.printf(({ timestamp, level, message }) => {
                    return `[${timestamp}] [${level}] ${message}`; // Custom log message format
                })
            )
        }),

        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }), // Error logs to file
        new winston.transports.File({ filename: 'logs/combined.log' }) // All logs to file
    ]
});

// Handle uncaught exceptions and log them to a separate file
logger.exceptions.handle(
    new winston.transports.File({ filename: 'logs/exceptions.log' })
);

// Export the configured logger
module.exports = logger;
