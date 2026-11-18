const { parse, positiveId } = require('../utils/validation');
const { startMissionSchema, completeMissionSchema } = require('../validators/progress');
const progressService = require('../services/progress.service');
const { QuestaoMissao, Missao, Jornada, Jogo, ProgressoUsuario, UsuarioConquista, Conquista } = require('../models');
const { notFound, forbidden, badRequest } = require('../utils/errors');
const { getMissionProgress } = require('../services/gamification.service');

const publicQuestion = (question) => ({
  id_questao: question.id_questao,
  enunciado: question.enunciado,
  opcoes: question.opcoes,
  ordem_questao: question.ordem_questao,
});

const progressController = {
  startMission: async (req, res) => {
    parse(startMissionSchema, req.body || {});
    const result = await progressService.startMission(req.authUser.id_usuario, positiveId(req.params.id, 'id_missao'));
    return res.status(201).json({ dados: result });
  },

  completeMission: async (req, res) => {
    const input = parse(completeMissionSchema, req.body);
    const result = await progressService.completeMission(req.authUser.id_usuario, positiveId(req.params.id, 'id_missao'), input);
    return res.json({ dados: result });
  },

  missionQuestions: async (req, res) => {
    const missionId = positiveId(req.params.id, 'id_missao');
    const mission = await Missao.findByPk(missionId, {
      include: [{ model: Jornada, as: 'jornada', attributes: ['status', 'nivel_minimo'], include: [{ model: Jogo, as: 'jogo', attributes: ['status'] }] }],
    });
    if (!mission || mission.status !== 'publicada' || mission.jornada?.status !== 'publicada' || mission.jornada?.jogo?.status !== 'ativo') {
      throw notFound('Missão não encontrada.');
    }
    const stats = await require('../services/gamification.service').getStats(req.authUser.id_usuario);
    if ((stats.nivel?.numero || 0) < Math.max(mission.nivel_minimo, mission.jornada.nivel_minimo)) throw forbidden('Esta missão está bloqueada para o seu nível.');
    const progress = await ProgressoUsuario.findOne({
      where: { id_usuario: req.authUser.id_usuario, id_missao: missionId },
    });
    if (!progress || progress.status !== 'iniciada') throw forbidden('Inicie a missão para ver suas questões.');
    const questions = await QuestaoMissao.findAll({
      where: { id_missao: missionId },
      attributes: ['id_questao', 'enunciado', 'opcoes', 'ordem_questao'],
      order: [['ordem_questao', 'ASC']],
    });
    if (!questions.length) throw badRequest('Esta missão ainda não possui questões.');
    return res.json({ dados: questions.map(publicQuestion) });
  },

  userProgress: async (req, res) => {
    const data = await getMissionProgress(req.authUser.id_usuario);
    return res.json({ dados: data });
  },

  userAchievements: async (req, res) => {
    const items = await UsuarioConquista.findAll({
      where: { id_usuario: req.authUser.id_usuario },
      include: [{ model: Conquista, as: 'conquista' }],
      order: [['conquistada_em', 'DESC']],
    });
    return res.json({
      dados: items.map((item) => ({
        ...item.conquista.toJSON(),
        conquistada_em: item.conquistada_em,
      })),
    });
  },

  startChallenge: async (req, res) => {
    const result = await progressService.startChallenge(
      req.authUser.id_usuario,
      positiveId(req.params.id, 'id_desafio'),
    );
    return res.status(201).json({ dados: result });
  },

  completeChallenge: async (req, res) => {
    const result = await progressService.completeChallenge(
      req.authUser.id_usuario,
      positiveId(req.params.id, 'id_desafio'),
    );
    return res.json({ dados: result });
  },

  contents: async (req, res) => {
    const { listContents } = require('../services/gamification.service');
    return res.json({ dados: await listContents(req.authUser.id_usuario) });
  },
};

module.exports = { progressController };

