const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const { loadEnv } = require('./config/env');
const { requestId } = require('./middleware/request-id');
const { createApiRouter } = require('./routes/api.routes');
const { notFoundHandler, errorHandler } = require('./middleware/error-handler');

function createApp(env = loadEnv()) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', env.NODE_ENV === 'production' ? 1 : false);

  app.use(helmet());
  app.use(requestId);
  app.use((req, res, next) => {
    if (req.path === '/api/docs' || req.path.startsWith('/api/docs/')) {
      res.removeHeader('Content-Security-Policy');
    }
    next();
  });

  const allowedOrigins = new Set(env.FRONTEND_ORIGINS);
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  }));

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '16kb' }));
  app.use(cookieParser());
  app.use((req, _res, next) => {
    const origin = req.get('origin');
    const requestOrigin = `${req.protocol}://${req.get('host')}`;
    // Alguns navegadores enviam Origin: null no formulário mesmo para a própria
    // página. Só aceitamos essa situação quando o navegador confirma a mesma
    // origem e apenas nos dois formulários de autenticação.
    const sameOriginForm = origin === 'null'
      && req.get('sec-fetch-site') === 'same-origin'
      && req.method === 'POST'
      && ['/api/forms/login', '/api/forms/cadastro'].includes(req.path)
      && req.is('application/x-www-form-urlencoded');
    if (origin && origin !== requestOrigin && !allowedOrigins.has(origin) && !sameOriginForm) {
      const { forbidden } = require('./utils/errors');
      return next(forbidden('Esta origem não está autorizada a acessar a API.'));
    }
    next();
  });

  const openapiPath = path.resolve(__dirname, '..', 'openapi.yaml');
  const openapi = YAML.parse(require('node:fs').readFileSync(openapiPath, 'utf8'));
  app.get('/api/openapi.json', (_req, res) => res.json(openapi));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi, {
    explorer: true,
    customSiteTitle: 'Nexa Play API',
  }));
  app.use('/api', createApiRouter(env));

  const siteRoot = path.resolve(__dirname, '..', '..');
  const serveStaticSite = express.static(siteRoot, {
    dotfiles: 'ignore',
    index: 'index.html',
    fallthrough: true,
  });
  const publicExtensions = new Set(['.html', '.css', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.woff2', '.ico']);
  app.use((req, res, next) => {
    if (!['GET', 'HEAD'].includes(req.method)) return next();
    if (req.path === '/backend' || req.path.startsWith('/backend/')) return next();
    if (req.path !== '/' && req.path !== '/assets/password-toggle.js' && !publicExtensions.has(path.extname(req.path).toLowerCase())) return next();
    return serveStaticSite(req, res, next);
  });

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
