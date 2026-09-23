// Allowlist public user fields; database rows must never be serialized directly.
const fields = [
  'id_usuario', 'nombre', 'email', 'rol', 'id_equipo', 'nombre_equipo',
  'id_conductor', 'habilidad', 'id_driver', 'habilidad_h', 'equipo_nombre', 'mensaje'
];

function publicUser(user) {
  if (!user) return null;
  return Object.fromEntries(fields.filter(key => Object.hasOwn(user, key)).map(key => [key, user[key]]));
}

module.exports = { publicUser };
