const { Transaction } = require('sequelize');
const {
  sequelize, Usuario, Jornada, Jogo, Missao, QuestaoMissao, ProgressoUsuario,
} = require('../models');
const { forbidden, notFound, conflict, unprocessable } = require('../utils/errors');
const { getStats, awardEligibleBadges } = require('./gamification.service');

async function lockPlayer(userId, transaction) {
  const user = await Usuario.findByPk(userId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!user || user.status !== 'ativo') throw forbidden('A conta não pode realizar esta ação.');
  return user;
}

async function findAvailableMission(missionId, userId, transaction) {
  const mission = await Missao.findByPk(missionId, {
    include: [{
      model: Jornada,
      as: 'jornada',
      attributes: ['id_jornada', 'id_jogo', 'nivel_minimo', 'status'],
      include: [{ model: Jogo, as: 'jogo', attributes: ['status'] }],
    }],
    transaction,
  });
  if (!mission || mission.status !== 'publicada' || mission.jornada?.status !== 'publicada' || mission.jornada?.jogo?.status !== 'ativo') {
    throw notFound('Missão não encontrada.');
  }

  const stats = await getStats(userId, transaction);
  const currentLevel = stats.nivel?.numero || 0;
  const requiredLevel = Math.max(mission.nivel_minimo, mission.jornada.nivel_minimo);
  if (currentLevel < requiredLevel) {
    throw forbidden('Esta missão ainda está bloqueada para o seu nível.');
  }
  return { mission, stats };
}

async function startMissionInTransaction(userId, missionId, transaction) {
  await lockPlayer(userId, transaction);
  const { mission } = await findAvailableMission(missionId, userId, transaction);
  let progress = await ProgressoUsuario.findOne({
    where: { id_usuario: userId, id_missao: mission.id_missao },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!progress) {
    progress = await ProgressoUsuario.create({
      id_usuario: userId,
      id_missao: mission.id_missao,
      status: 'iniciada',
      iniciada_em: new Date(),
      xp_obtido: 0,
    }, { transaction });
  }
  return { mission, progress };
}

async function startMission(userId, missionId) {
  return sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED }, (transaction) =>
    startMissionInTransaction(userId, missionId, transaction));
}

async function completeMission(userId, missionId, input) {
  return sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED }, async (transaction) => {
    await lockPlayer(userId, transaction);
    const { mission } = await findAvailableMission(missionId, userId, transaction);
    const progress = await ProgressoUsuario.findOne({
      where: { id_usuario: userId, id_missao: mission.id_missao },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!progress) throw conflict('Inicie a missão antes de concluí-la.');
    if (progress.status === 'concluida') {
      return { progresso: progress, repetida: true, novas_conquistas: [] };
    }

    let nota = 100;
    if (mission.tipo === 'quiz') {
      if (input.tipo !== 'quiz') throw unprocessable('RESPOSTA_OBRIGATORIA', 'Envie as respostas do quiz.');
      const questions = await QuestaoMissao.findAll({
        where: { id_missao: mission.id_missao },
        order: [['ordem_questao', 'ASC']],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!questions.length) throw conflict('Este quiz ainda não tem questões cadastradas.');
      const answers = new Map(input.respostas.map((item) => [item.id_questao, item.indice_opcao]));
      if (input.respostas.length !== questions.length || answers.size !== questions.length || questions.some((item) => !answers.has(item.id_questao))) {
        throw unprocessable('RESPOSTAS_INCOMPLETAS', 'Responda todas as questões do quiz.');
      }
      let correct = 0;
      for (const question of questions) {
        const selected = answers.get(question.id_questao);
        if (selected < question.opcoes.length && selected === question.indice_resposta) correct += 1;
      }
      nota = (correct / questions.length) * 100;
      if (nota < Number(mission.nota_minima)) {
        throw unprocessable('QUIZ_NAO_APROVADO', 'A pontuação mínima da missão não foi atingida.', {
          nota: Math.round(nota),
          nota_minima: Number(mission.nota_minima),
        });
      }
    } else if (input.tipo !== 'confirmacao' || input.confirmada !== true) {
      throw unprocessable('CONFIRMACAO_OBRIGATORIA', 'Confirme a conclusão da missão.');
    }

    progress.status = 'concluida';
    progress.concluida_em = new Date();
    progress.xp_obtido = mission.xp_recompensa;
    await progress.save({ transaction });

    const stats = await getStats(userId, transaction);
    const novasConquistas = await awardEligibleBadges(userId, stats, transaction);
    const journeyMissions = await Missao.findAll({
      where: { id_jornada: mission.id_jornada, status: 'publicada' },
      attributes: ['id_missao'],
      transaction,
    });
    const completedIds = new Set((await ProgressoUsuario.findAll({
      where: {
        id_usuario: userId,
        status: 'concluida',
        id_missao: journeyMissions.map((item) => item.id_missao),
      },
      attributes: ['id_missao'],
      transaction,
    })).map((item) => item.id_missao));

    return {
      progresso: progress,
      repetida: false,
      nota: mission.tipo === 'quiz' ? Math.round(nota) : null,
      jornada_concluida: journeyMissions.length > 0 && completedIds.size === journeyMissions.length,
      xp_total: stats.xp_total,
      nivel: stats.nivel,
      novas_conquistas: novasConquistas.map((item) => ({
        id_conquista: item.conquista.id_conquista,
        codigo: item.conquista.codigo,
        titulo: item.conquista.titulo,
        descricao: item.conquista.descricao,
        conquistada_em: item.conquistada_em,
      })),
    };
  });
}

async function startChallenge(userId, challengeId) {
  const { Desafio, ParticipacaoDesafio } = require('../models');
  return sequelize.transaction(async (transaction) => {
    await lockPlayer(userId, transaction);
    const challenge = await Desafio.findByPk(challengeId, { transaction, lock: transaction.LOCK.UPDATE });
    const now = new Date();
    if (!challenge || challenge.status !== 'ativo' || now < challenge.inicia_em || now > challenge.termina_em) {
      throw notFound('Desafio indisponível.');
    }

    const { progress, mission } = await startMissionInTransaction(userId, challenge.id_missao, transaction);
    if (mission.jornada.id_jogo !== challenge.id_jogo) throw conflict('A missão vinculada não pertence ao jogo deste desafio.');
    let participation = await ParticipacaoDesafio.findOne({
      where: { id_usuario: userId, id_desafio: challenge.id_desafio },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!participation) {
      participation = await ParticipacaoDesafio.create({
        id_usuario: userId,
        id_desafio: challenge.id_desafio,
        status: 'iniciada',
        iniciada_em: now,
        xp_obtido: 0,
      }, { transaction });
    }
    return { desafio: challenge, participacao: participation, progresso_missao: progress };
  });
}

async function completeChallenge(userId, challengeId) {
  const { Desafio, ParticipacaoDesafio, ProgressoUsuario } = require('../models');
  return sequelize.transaction(async (transaction) => {
    await lockPlayer(userId, transaction);
    const challenge = await Desafio.findByPk(challengeId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!challenge || challenge.status !== 'ativo') throw notFound('Desafio não encontrado.');
    const participation = await ParticipacaoDesafio.findOne({
      where: { id_usuario: userId, id_desafio: challengeId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!participation) throw conflict('Inicie o desafio antes de concluí-lo.');
    if (participation.status === 'concluida') {
      return { participacao: participation, repetida: true, novas_conquistas: [] };
    }

    const missionProgress = await ProgressoUsuario.findOne({
      where: { id_usuario: userId, id_missao: challenge.id_missao, status: 'concluida' },
      transaction,
    });
    if (!missionProgress) throw conflict('Conclua a missão vinculada antes de finalizar o desafio.');
    const now = new Date();
    if (now > challenge.termina_em || now < challenge.inicia_em || participation.iniciada_em > challenge.termina_em) {
      throw conflict('O período do desafio terminou.');
    }

    participation.status = 'concluida';
    participation.concluida_em = new Date();
    participation.xp_obtido = challenge.xp_bonus;
    await participation.save({ transaction });

    const stats = await getStats(userId, transaction);
    const novasConquistas = await awardEligibleBadges(userId, stats, transaction);
    return {
      participacao: participation,
      repetida: false,
      xp_total: stats.xp_total,
      nivel: stats.nivel,
      novas_conquistas: novasConquistas.map((item) => ({
        id_conquista: item.conquista.id_conquista,
        codigo: item.conquista.codigo,
        titulo: item.conquista.titulo,
      })),
    };
  });
}

module.exports = {
  startMission,
  completeMission,
  startChallenge,
  completeChallenge,
  startMissionInTransaction,
  findAvailableMission,
};

