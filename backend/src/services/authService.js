const argon2 = require('argon2');
const crypto = require('crypto');
const userModel = require('../models/userModel');
const sessionModel = require('../models/sessionModel');
const { publicUser } = require('../security/userResponse');
const { authError, registrationData, sessionTimeoutMs } = require('../security/authPolicy');

async function persistUser(data) {
  const passwordHash = await argon2.hash(data.password);
  try {
    const result = await userModel.register({
      nombre: data.nombre, email: data.email, password_hash: passwordHash,
      rol: data.rol, id_equipo: data.id_equipo
    });
    return publicUser(result.recordset[0]);
  } catch (error) {
    if (error.number === 2627 || error.number === 2601 ||
        String(error.message).includes('correo electrónico ya está registrado')) {
      throw authError(409, 'El correo electrónico ya está registrado', 'EMAIL_EXISTS');
    }
    throw error;
  }
}

const authService = {
  async registerUser(userData) {
    return persistUser(registrationData(userData));
  },

  async createAccount(userData, actor) {
    if (actor?.rol !== 'Admin') {
      throw authError(403, 'No autorizado', 'FORBIDDEN');
    }
    return persistUser(registrationData(userData, true));
  },

  async loginUser(email, password) {
    const invalid = () => authError(401, 'Credenciales inválidas', 'INVALID_CREDENTIALS');
    if (typeof email !== 'string' || typeof password !== 'string' ||
        !email.trim() || email.length > 200 || !password || password.length > 128) {
      throw invalid();
    }

    let result;
    try {
      result = await userModel.getByEmail(email.trim());
    } catch (error) {
      if (String(error.message).includes('Usuario no encontrado')) throw invalid();
      throw error;
    }
    const user = result.recordset?.[0];
    if (!user || user.activo === false || user.activo === 0) throw invalid();

    if (!await argon2.verify(user.password_hash, password)) throw invalid();
    const sessionId = crypto.randomBytes(32).toString('hex');
    await sessionModel.saveSession(sessionId, user.id_usuario, Math.floor(sessionTimeoutMs() / 60000));
    return { sessionId, user: publicUser(user) };
  }
};

module.exports = authService;
