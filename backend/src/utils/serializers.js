const { Op } = require('sequelize');

function publicUser(user) {
  if (!user) return null;
  const value = user.toJSON ? user.toJSON() : { ...user };
  delete value.senha_hash;
  delete value.token_version;
  delete value.excluido_em;
  return value;
}

function pagination(query) {
  const pagina = Math.max(1, Number.parseInt(query.pagina, 10) || 1);
  const limite = Math.min(100, Math.max(1, Number.parseInt(query.limite, 10) || 20));
  return { pagina, limite, offset: (pagina - 1) * limite };
}

function searchWhere(query, fields) {
  const search = typeof query.q === 'string' ? query.q.trim().slice(0, 100) : '';
  if (!search || !fields.length) return {};
  return { [Op.or]: fields.map((field) => ({ [field]: { [Op.like]: `%${search}%` } })) };
}

module.exports = { publicUser, pagination, searchWhere };

