const { UniqueConstraintError, ForeignKeyConstraintError, ValidationError } = require('sequelize');
const { AppError } = require('../utils/errors');

function notFoundHandler(req, _res, next) {
  const error = new AppError(404, 'ROUTE_NOT_FOUND', 'Rota não encontrada.');
  error.path = req.path;
  next(error);
}

function errorHandler(error, req, res, _next) {
  let normalized = error;

  if (error?.type === 'entity.parse.failed' || (error instanceof SyntaxError && error.status === 400)) {
    normalized = new AppError(400, 'INVALID_JSON', 'O corpo da requisição contém JSON inválido.');
  } else if (error instanceof UniqueConstraintError) {
    normalized = new AppError(409, 'DUPLICATE_RECORD', 'Já existe um registro com esses dados.');
  } else if (error instanceof ForeignKeyConstraintError) {
    normalized = new AppError(409, 'RELATED_RECORDS', 'Este registro está relacionado a outros dados e não pode ser removido.');
  } else if (error instanceof ValidationError) {
    normalized = new AppError(400, 'INVALID_DATA', 'Os dados enviados não são válidos.');
  } else if (!(error instanceof AppError)) {
    normalized = new AppError(500, 'INTERNAL_ERROR', 'Ocorreu um erro interno.');
    console.error({
      event: 'api_error',
      requestId: req.id,
      name: error.name || 'Error',
      code: error.code || undefined,
    });
  }

  // Os formulários HTML precisam de uma resposta legível para quem usa o site.
  // A API JSON mantém o formato original para os demais clientes.
  const formPage = req.method === 'POST' && {
    '/api/forms/login': { href: '/login.html', title: 'Não foi possível entrar' },
    '/api/forms/cadastro': { href: '/cadastro.html', title: 'Não foi possível criar a conta' },
  }[req.originalUrl.split('?')[0]];
  if (formPage) {
    const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[char]);
    return res.status(normalized.status).type('html').send(`<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${formPage.title} | Nexa Play</title><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/auth.css"></head>
<body class="auth-page"><main class="auth-main"><div class="auth-content"><h1 class="auth-heading">${formPage.title}</h1><p class="auth-intro">${escapeHtml(normalized.message)}</p><a class="auth-nav-button" href="${formPage.href}">VOLTAR E TENTAR NOVAMENTE</a></div></main></body></html>`);
  }

  const body = {
    erro: {
      codigo: normalized.code,
      mensagem: normalized.message,
      ...(normalized.details ? { detalhes: normalized.details } : {}),
    },
    request_id: req.id,
  };

  return res.status(normalized.status).json(body);
}

module.exports = { notFoundHandler, errorHandler };

