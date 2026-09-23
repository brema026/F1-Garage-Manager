function corsOptions(env = process.env) {
  const port = env.FRONTEND_PORT || '3000';
  if (env.NODE_ENV === 'production' && !env.FRONTEND_ORIGINS?.trim()) {
    throw new Error('FRONTEND_ORIGINS is required in production');
  }
  const origins = (env.FRONTEND_ORIGINS || 'http://localhost:' + port + ',http://127.0.0.1:' + port)
    .split(',').map(value => value.trim()).filter(Boolean);
  for (const origin of origins) {
    const url = new URL(origin);
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin ||
        (env.NODE_ENV === 'production' && url.protocol !== 'https:')) {
      throw new Error('Invalid FRONTEND_ORIGINS configuration');
    }
  }
  return {
    origin(origin, callback) {
      // CLI clients without Origin still require normal session/role authorization.
      if (!origin || origins.includes(origin)) return callback(null, true);
      return callback(Object.assign(new Error('Origin not allowed'), { code: 'ORIGIN_NOT_ALLOWED' }));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };
}

module.exports = { corsOptions };
