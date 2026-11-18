const { rateLimit } = require('express-rate-limit');
const { AppError } = require('../utils/errors');

function createAuthLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) => next(new AppError(
      429, 'RATE_LIMITED', 'Muitas tentativas. Aguarde alguns minutos.',
    )),
  });
}

module.exports = { createAuthLimiter };

