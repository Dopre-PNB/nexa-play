const { Op } = require('sequelize');
const {
  Usuario, Nivel, ProgressoUsuario, ParticipacaoDesafio, Jornada, Jogo,
  Missao, UsuarioConquista, Conquista, Conteudo,
} = require('../models');

async function getStats(userId, transaction) {
  const missionXp = await ProgressoUsuario.sum('xp_obtido', {
    where: { id_usuario: userId, status: 'concluida' },
    transaction,
  }) || 0;
  const challengeXp = await ParticipacaoDesafio.sum('xp_obtido', {
    where: { id_usuario: userId, status: 'concluida' },
    transaction,
  }) || 0;
  const missionsCompleted = await ProgressoUsuario.count({
    where: { id_usuario: userId, status: 'concluida' },
    transaction,
  });
  const challengesCompleted = await ParticipacaoDesafio.count({
    where: { id_usuario: userId, status: 'concluida' },
    transaction,
  });

  const completedRows = await ProgressoUsuario.findAll({
    where: { id_usuario: userId, status: 'concluida' },
    attributes: ['id_missao'],
    include: [{ model: Missao, as: 'missao', attributes: ['id_jornada'] }],
    transaction,
  });
  const publishedJourneys = await Jornada.findAll({
    where: { status: 'publicada' },
    attributes: ['id_jornada'],
    include: [
      { model: Jogo, as: 'jogo', where: { status: 'ativo' }, attributes: [], required: true },
      {
        model: Missao,
        as: 'missoes',
        where: { status: 'publicada' },
        attributes: ['id_missao'],
        required: true,
      },
    ],
    transaction,
  });
  const completedMissionIds = new Set(completedRows.map((row) => row.id_missao));
  const completedJourneyIds = new Set();
  for (const journey of publishedJourneys) {
    const requiredMissions = journey.missoes.map((mission) => mission.id_missao);
    if (requiredMissions.length && requiredMissions.every((id) => completedMissionIds.has(id))) {
      completedJourneyIds.add(journey.id_jornada);
    }
  }

  const totalXp = Number(missionXp) + Number(challengeXp);
  const level = await Nivel.findOne({
    where: { xp_minimo: { [Op.lte]: totalXp } },
    order: [['numero_nivel', 'DESC']],
    transaction,
  });

  return {
    xp_total: totalXp,
    missoes_concluidas: missionsCompleted,
    jornadas_concluidas: completedJourneyIds.size,
    desafios_concluidos: challengesCompleted,
    nivel: level ? { numero: level.numero_nivel, titulo: level.titulo, xp_minimo: level.xp_minimo } : null,
  };
}

async function awardEligibleBadges(userId, stats, transaction) {
  const badges = await Conquista.findAll({ where: { status: 'ativo' }, transaction });
  const newlyAwarded = [];

  for (const badge of badges) {
    const value = stats[badge.criterio];
    if (value == null || value < badge.meta) continue;

    const [award, created] = await UsuarioConquista.findOrCreate({
      where: { id_usuario: userId, id_conquista: badge.id_conquista },
      defaults: { id_usuario: userId, id_conquista: badge.id_conquista, conquistada_em: new Date() },
      transaction,
    });
    if (created) newlyAwarded.push({ conquista: badge, conquistada_em: award.conquistada_em });
  }
  return newlyAwarded;
}

async function getProfile(userId) {
  const user = await Usuario.findByPk(userId, { attributes: ['id_usuario', 'nome_jogador', 'email', 'papel', 'status', 'criado_em'] });
  const stats = await getStats(userId);
  const conquistas = await UsuarioConquista.findAll({
    where: { id_usuario: userId },
    include: [{ model: Conquista, as: 'conquista', attributes: ['id_conquista', 'codigo', 'titulo', 'descricao', 'icone'] }],
    order: [['conquistada_em', 'DESC']],
  });

  return {
    usuario: user,
    ...stats,
    conquistas: conquistas.map((item) => ({
      ...item.conquista.toJSON(),
      conquistada_em: item.conquistada_em,
    })),
  };
}

async function getMissionProgress(userId) {
  return Jornada.findAll({
    where: { status: 'publicada' },
    attributes: ['id_jornada', 'id_jogo', 'slug', 'titulo', 'descricao', 'ordem_jornada', 'nivel_minimo'],
    include: [
      { model: Jogo, as: 'jogo', where: { status: 'ativo' }, attributes: [], required: true },
      {
        model: Missao,
        as: 'missoes',
        where: { status: 'publicada' },
        attributes: ['id_missao', 'slug', 'titulo', 'descricao', 'ordem_missao', 'tipo', 'xp_recompensa', 'nivel_minimo'],
        required: false,
        include: [{
          model: ProgressoUsuario,
          as: 'progresso',
          where: { id_usuario: userId },
          attributes: ['status', 'iniciada_em', 'concluida_em', 'xp_obtido'],
          required: false,
        }],
      },
    ],
    order: [['ordem_jornada', 'ASC'], [{ model: Missao, as: 'missoes' }, 'ordem_missao', 'ASC']],
  });
}

async function listContents(userId) {
  const stats = await getStats(userId);
  const rows = await Conteudo.findAll({
    where: { status: 'ativo' },
    include: [{ model: Jogo, as: 'jogo', where: { status: 'ativo' }, attributes: [], required: true }],
    order: [['id_conteudo', 'ASC']],
  });
  const currentLevel = stats.nivel?.numero || 0;
  return rows.map((row) => {
    const available = stats.xp_total >= row.xp_minimo && currentLevel >= row.nivel_minimo;
    const item = {
      id_conteudo: row.id_conteudo,
      id_jogo: row.id_jogo,
      slug: row.slug,
      titulo: row.titulo,
      resumo: row.resumo,
      tipo: row.tipo,
      nivel_minimo: row.nivel_minimo,
      xp_minimo: row.xp_minimo,
      disponivel: available,
    };
    if (available) {
      item.corpo = row.corpo;
      item.url = row.url;
    }
    return item;
  });
}

async function getProfileForTransaction(userId, transaction) {
  return getStats(userId, transaction);
}

module.exports = {
  getStats,
  getProfile,
  getMissionProgress,
  listContents,
  awardEligibleBadges,
  getProfileForTransaction,
};

