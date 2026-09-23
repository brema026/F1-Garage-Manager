function authError(status, message, code) {
  return Object.assign(new Error(message), { status, code });
}

function registrationData(input, managed = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw authError(400, 'Datos de registro inválidos', 'INVALID_REGISTRATION');
  }
  const { nombre, email, password } = input;
  if (typeof nombre !== 'string' || !nombre.trim() || nombre.trim().length > 120 ||
      typeof email !== 'string' || email.trim().length > 200 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw authError(400, 'Nombre, correo o contraseña inválidos (contraseña: 8–128 caracteres)', 'INVALID_REGISTRATION');
  }

  const rol = input.rol ?? 'Driver';
  if (!managed && (rol !== 'Driver' ||
      (input.id_equipo != null && input.id_equipo !== 0 && input.id_equipo !== '0'))) {
    throw authError(403, 'El registro público solo permite conductores sin equipo', 'REGISTRATION_FORBIDDEN');
  }
  if (!['Admin', 'Engineer', 'Driver'].includes(rol)) {
    throw authError(400, 'Rol inválido', 'INVALID_ROLE');
  }
  const id_equipo = managed ? Number(input.id_equipo ?? 0) : 0;
  if (!Number.isInteger(id_equipo) || id_equipo < 0 ||
      (managed && rol === 'Engineer' && id_equipo === 0)) {
    throw authError(400, 'Un ingeniero necesita un equipo válido', 'INVALID_TEAM');
  }
  return { nombre: nombre.trim(), email: email.trim(), password, rol, id_equipo };
}

function sessionTimeoutMs(env = process.env) {
  const value = Number(env.SESSION_TIMEOUT ?? 3600000);
  if (!Number.isInteger(value) || value < 60000 || value > 86400000 || value % 60000 !== 0) {
    throw new Error('SESSION_TIMEOUT must be a whole number of minutes, between 60000 and 86400000 milliseconds');
  }
  return value;
}

module.exports = { authError, registrationData, sessionTimeoutMs };
