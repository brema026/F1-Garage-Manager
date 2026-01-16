const argon2 = require('argon2'); // Import Argon2 for password hashing
const userModel = require('../models/userModel'); // Import the user model

// Auth service with authentication functions
const authService = {
    // Register a new user
    async registerUser(userData) {
        const passwordHash = await argon2.hash(userData.password); // Hash the password using Argon2

        // Call the user model to register the new user
        const result = await userModel.register({
            nombre: userData.nombre,
            email: userData.email,
            password_hash: passwordHash,
            rol: userData.rol,
            id_equipo: userData.id_equipo
        });

        return result.recordset[0]; // Return the newly created user
    }
};

// Export the auth service for use in other parts of the application
module.exports = authService;