const authService = require('../services/authService');
const logger = require('../config/logger');
const { getPool } = require('../config/database');
const sql = require('mssql');
const { publicUser } = require('../security/userResponse');
const { sessionTimeoutMs } = require('../security/authPolicy');

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Lax',
  path: '/'
});

function authFailure(res, error) {
  const expected = ['INVALID_REGISTRATION', 'REGISTRATION_FORBIDDEN', 'INVALID_ROLE',
    'INVALID_TEAM', 'EMAIL_EXISTS', 'FORBIDDEN', 'INVALID_CREDENTIALS'];
  if (expected.includes(error.code)) {
    return res.status(error.status).json({ error: error.message });
  }
  logger.error('Authentication operation failed');
  return res.status(500).json({ error: 'Error interno del servidor' });
}

const authController = {
  async register(req, res) {
    try {
      const user = await authService.registerUser(req.body);
      logger.info('Public account registered');
      return res.status(201).json({ message: 'User registered successfully', user: publicUser(user) });
    } catch (error) { return authFailure(res, error); }
  },

  async createAccount(req, res) {
    try {
      const user = await authService.createAccount(req.body, req.user);
      logger.info('Account created by administrator');
      return res.status(201).json({ message: 'User registered successfully', user: publicUser(user) });
    } catch (error) { return authFailure(res, error); }
  },

  async login(req, res) {
    try {
      const { sessionId, user } = await authService.loginUser(req.body?.email, req.body?.password);
      res.cookie('sessionId', sessionId, { ...cookieOptions(), maxAge: sessionTimeoutMs() });
      logger.info('User logged in');
      return res.status(200).json({ message: 'Login successful', user: publicUser(user) });
    } catch (error) { return authFailure(res, error); }
  },

  async logout(req, res) {
    try {
      const sessionId = req.cookies?.sessionId;
      if (sessionId) {
        const pool = getPool();
        await pool.request().input('id_sesion', sql.NVarChar, sessionId).execute('dbo.sp_cerrar_sesion');
      }
      logger.info('User logged out');
      res.clearCookie('sessionId', cookieOptions());
      return res.status(200).json({ message: 'Logout successful' });
    } catch (error) { return authFailure(res, error); }
  },

  async checkAuth(req, res) {
    return res.status(200).json({ authenticated: true, user: publicUser(req.user) });
  },

  async getProfile(req, res) {
    try {
      const result = await getPool().request()
        .input('id_usuario', sql.Int, req.user.id_usuario)
        .execute('dbo.sp_obtener_perfil_detallado');
      if (!result.recordset.length) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json({ status: 'SUCCESS', user: publicUser(result.recordset[0]) });
    } catch (error) { return authFailure(res, error); }
  }
};

module.exports = authController;
