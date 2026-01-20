const argon2 = require('argon2'); // Import Argon2 for password hashing
const userModel = require('../models/userModel'); // Import the user model
const sessionModel = require('../models/sessionModel'); // Import the session model
const crypto = require('crypto'); // Import crypto for generating session IDs

// Auth service with authentication functions
const authService = {
    // Register a new user
    async registerUser(userData) {
        const passwordHash = await argon2.hash(userData.password); // Hash the password using Argon2

        try {
            // Call the user model to register the new user
            const result = await userModel.register({
                nombre: userData.nombre,
                email: userData.email,
                password_hash: passwordHash,
                rol: userData.rol,
                id_equipo: userData.id_equipo
            });

            return result.recordset[0]; // Return the newly created user
        } catch (error) {
            // Detectar error de email duplicado de SQL Server
            if (error.message && error.message.includes('correo electrónico ya está registrado')) {
                const duplicateError = new Error('El correo electrónico ya está registrado');
                duplicateError.code = 'EMAIL_EXISTS';
                throw duplicateError;
            }
            
            // Detectar constraint violation de SQL Server (UK violation)
            if (error.number === 2627 || error.number === 2601) {
                const duplicateError = new Error('El correo electrónico ya está registrado');
                duplicateError.code = 'EMAIL_EXISTS';
                throw duplicateError;
            }

            throw error; // Re-throw other errors
        }
    },

    async loginUser(email, password) {
        const result = await userModel.getByEmail(email); // Get user by email
        const user = result.recordset[0]; // Extract user from result

        // Check if user exists
        if (!user) {
            throw new Error('Usuario no encontrado'); // Throw error if user does not exist
        }

        // Verify the provided password against the stored hash
        const validPassword = await argon2.verify(user.password_hash, password); 
        if (!validPassword) throw new Error('Contraseña incorrecta'); // Throw error if password is invalid

        // Generate a new session ID (for simplicity, using a random string here)
        const sessionId = crypto.randomBytes(32).toString('hex');

        // Calculate session timeout in minutes from environment variable
        const timeoutMs = parseInt(process.env.SESSION_TIMEOUT) || 3600000; // Default to 1 hour if not set
        const timeoutMinutes = Math.floor(timeoutMs / 60000); // Convert timeout to minutes

        // Save the new session in the database
        await sessionModel.saveSession(sessionId, user.id_usuario, timeoutMinutes);

        return { sessionId, user }; // Return session ID and user info
    }
};

// Export the auth service for use in other parts of the application
module.exports = authService;