class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const badRequest = (message, details) => new AppError(400, 'BAD_REQUEST', message, details);
const unauthorized = (message = 'Faça login para continuar.') =>
  new AppError(401, 'UNAUTHORIZED', message);
const forbidden = (message = 'Você não tem permissão para esta ação.') =>
  new AppError(403, 'FORBIDDEN', message);
const notFound = (message = 'Registro não encontrado.') => new AppError(404, 'NOT_FOUND', message);
const conflict = (message = 'Este registro já existe ou não pode ser alterado.') =>
  new AppError(409, 'CONFLICT', message);
const unprocessable = (code, message, details) => new AppError(422, code, message, details);

module.exports = { AppError, badRequest, unauthorized, forbidden, notFound, conflict, unprocessable };

