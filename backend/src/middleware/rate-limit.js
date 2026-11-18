const { rateLimit } = require('express-rate-limit');

function createAuthLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({
      erro: { codigo: 'RATE_LIMITED', mensagem: 'Muitas tentativas. Aguarde alguns minutos.' },
    }),
  });
}

module.exports = { createAuthLimiter };

