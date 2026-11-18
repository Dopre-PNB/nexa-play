const { badRequest } = require('./errors');

function parse(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw badRequest('Confira os campos enviados.', result.error.issues.map((issue) => ({
      campo: issue.path.join('.'),
      mensagem: issue.message,
    })));
  }
  return result.data;
}

function positiveId(value, field = 'id') {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw badRequest(`${field} deve ser um número inteiro positivo.`);
  }
  return id;
}

module.exports = { parse, positiveId };

