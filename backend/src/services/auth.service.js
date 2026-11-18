const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');
const { conflict, unauthorized, forbidden } = require('../utils/errors');

async function register(input) {
  const exists = await Usuario.findOne({ where: { email: input.email }, paranoid: false });
  if (exists) throw conflict('Este e-mail já está cadastrado.');

  const senha_hash = await bcrypt.hash(input.senha, 12);
  const user = await Usuario.create({
    nome_jogador: input.nome_jogador,
    email: input.email,
    senha_hash,
    papel: 'jogador',
    status: 'ativo',
  });
  return user;
}

async function login(input) {
  const user = await Usuario.findOne({ where: { email: input.email } });
  const valid = user ? await bcrypt.compare(input.senha, user.senha_hash) : false;
  if (!valid) throw unauthorized('E-mail ou senha inválidos.');
  if (user.status !== 'ativo') throw forbidden('Esta conta está suspensa.');
  return user;
}

async function changePassword(user, currentPassword, nextPassword) {
  const valid = await bcrypt.compare(currentPassword, user.senha_hash);
  if (!valid) throw unauthorized('A senha atual não confere.');
  user.senha_hash = await bcrypt.hash(nextPassword, 12);
  user.token_version += 1;
  return user;
}

module.exports = { register, login, changePassword };

