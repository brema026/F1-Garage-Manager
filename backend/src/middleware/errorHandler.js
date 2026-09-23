const logger = require('../config/logger');

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.code === 'ORIGIN_NOT_ALLOWED') return res.status(403).json({ error: 'Origen no autorizado' });
  if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
  if (error.type === 'entity.too.large') return res.status(413).json({ error: 'Solicitud demasiado grande' });
  // Database/driver messages can contain queries or connection details.
  logger.error('Unhandled request error');
  return res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = errorHandler;
