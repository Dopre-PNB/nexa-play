const { randomBytes } = require('node:crypto');
const { Op } = require('sequelize');
const { Usuario, Conquista, UsuarioConquista, Compartilhamento } = require('../models');
const { notFound, forbidden } = require('../utils/errors');

async function createShare(userId, achievementId, env) {
  const earned = await UsuarioConquista.findOne({
    where: { id_usuario: userId, id_conquista: achievementId },
    include: [{ model: Conquista, as: 'conquista', where: { status: 'ativo' } }],
  });
  if (!earned) throw notFound('Conquista não encontrada na sua conta.');

  const token = randomBytes(24).toString('hex');
  const share = await Compartilhamento.create({
    id_usuario: userId,
    id_conquista: achievementId,
    token,
    expira_em: null,
    revogado_em: null,
  });
  return {
    id_compartilhamento: share.id_compartilhamento,
    url: `${env.API_PUBLIC_URL.replace(/\/$/, '')}/compartilhamentos/${token}`,
    expira_em: share.expira_em,
  };
}

async function getPublicShare(token) {
  const share = await Compartilhamento.findOne({
    where: { token, revogado_em: null, [Op.or]: [{ expira_em: null }, { expira_em: { [Op.gt]: new Date() } }] },
    include: [
      { model: Usuario, as: 'usuario', attributes: ['nome_jogador'] },
      { model: Conquista, as: 'conquista', attributes: ['codigo', 'titulo', 'descricao', 'icone'], where: { status: 'ativo' } },
    ],
  });
  if (!share) throw notFound('Compartilhamento não encontrado ou expirado.');

  return {
    tipo: 'conquista_nexa_play',
    jogador: share.usuario.nome_jogador,
    conquista: {
      codigo: share.conquista.codigo,
      titulo: share.conquista.titulo,
      descricao: share.conquista.descricao,
      icone: share.conquista.icone,
      conquistada_em: (await UsuarioConquista.findOne({
        where: { id_usuario: share.id_usuario, id_conquista: share.id_conquista },
        attributes: ['conquistada_em'],
      }))?.conquistada_em || null,
    },
    compartilhado_em: share.criado_em,
  };
}

async function revokeShare(userId, shareId) {
  const share = await Compartilhamento.findByPk(shareId);
  if (!share) throw notFound('Compartilhamento não encontrado.');
  if (share.id_usuario !== userId) throw forbidden();
  if (!share.revogado_em) {
    share.revogado_em = new Date();
    await share.save();
  }
  return share;
}

module.exports = { createShare, getPublicShare, revokeShare };

