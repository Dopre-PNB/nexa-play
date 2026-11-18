const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { unauthorized, forbidden } = require('../utils/errors');
const { publicUser } = require('../utils/serializers');

function createAuthMiddleware(env) {
  async function authenticate(req, _res, next) {
    try {
      const cookieToken = req.cookies?.[env.COOKIE_NAME];
      const authHeader = req.get('authorization');
      const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
      const token = cookieToken || bearerToken;
      if (!token) throw unauthorized();

      let payload;
      try {
        payload = jwt.verify(token, env.JWT_SECRET, {
          issuer: 'nexa-play-api',
          audience: 'nexa-play-client',
        });
      } catch {
        throw unauthorized('Sessão inválida ou expirada.');
      }

      const user = await Usuario.findByPk(Number(payload.sub));
      if (!user || user.status !== 'ativo' || Number(user.token_version) !== Number(payload.ver)) {
        throw unauthorized('Sessão inválida ou expirada.');
      }

      req.authUser = user;
      req.user = publicUser(user);
      return next();
    } catch (error) {
      return next(error);
    }
  }

  async function optionalAuthenticate(req, _res, next) {
    const hasCookie = Boolean(req.cookies?.[env.COOKIE_NAME]);
    const hasBearer = req.get('authorization')?.startsWith('Bearer ');
    if (!hasCookie && !hasBearer) return next();
    return authenticate(req, _res, next);
  }

  function requireAdmin(req, _res, next) {
    if (!req.authUser) return next(unauthorized());
    if (req.authUser.papel !== 'admin') return next(forbidden());
    return next();
  }

  return { authenticate, optionalAuthenticate, requireAdmin };
}

function issueToken(user, env) {
  return jwt.sign(
    { sub: String(user.id_usuario), ver: user.token_version },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
      issuer: 'nexa-play-api',
      audience: 'nexa-play-client',
    },
  );
}

function setSessionCookie(res, token, env) {
  const maxAge = 8 * 60 * 60 * 1000;
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
}

function clearSessionCookie(res, env) {
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
  });
}

module.exports = { createAuthMiddleware, issueToken, setSessionCookie, clearSessionCookie };

