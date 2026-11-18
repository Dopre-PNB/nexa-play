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

