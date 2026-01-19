const { getPool } = require('../config/database');
const sql = require('mssql');
const logger = require('../config/logger');

const protect = async (req, res, next) => {
  try {
    const sessionId = req.cookies?.sessionId;

    if (!sessionId) {
      logger.warn('No session ID provided in cookies');
      return res.status(401).json({ error: 'No session ID provided, session not found' });
    }

    const pool = await getPool();

    const result = await pool.request()
      .input('sessionId', sql.VarChar, sessionId)
      .query(`
        SELECT s.id_usuario, u.nombre, u.rol, u.id_equipo
        FROM dbo.sesion s
        JOIN dbo.usuario u ON s.id_usuario = u.id_usuario
        WHERE s.id_sesion = @sessionId AND s.expira > SYSUTCDATETIME()
      `);

    if (result.recordset.length === 0) {
      logger.warn(`Invalid or expired session: ${sessionId}`);
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    req.user = result.recordset[0];
    next();
  } catch (e) {
    logger.error(`Auth Middleware Error: ${e.message}`);
    res.status(500).json({ error: 'Server error in authentication middleware' });
  }
};

module.exports = { protect };
