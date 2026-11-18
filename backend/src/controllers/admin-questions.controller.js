const { Missao, QuestaoMissao } = require('../models');
const { parse, positiveId } = require('../utils/validation');
const { schemas, partial } = require('../validators/catalog');
const { notFound, conflict, badRequest } = require('../utils/errors');

const questionPatchSchema = partial(schemas.questao)
  .refine((value) => Object.keys(value).length > 0, 'Informe ao menos um campo.');

function validateAnswerIndex(question) {
  if (question.indice_resposta >= question.opcoes.length) {
    throw badRequest('A resposta correta precisa apontar para uma opção existente.');
  }
}

const adminQuestionsController = {
  list: async (req, res) => {
    const missionId = positiveId(req.params.id, 'id_missao');
    const mission = await Missao.findByPk(missionId);
    if (!mission) throw notFound('Missão não encontrada.');
    const questions = await QuestaoMissao.findAll({ where: { id_missao: missionId }, order: [['ordem_questao', 'ASC']] });
    return res.json({ dados: questions });
  },
  create: async (req, res) => {
    const missionId = positiveId(req.params.id, 'id_missao');
    const mission = await Missao.findByPk(missionId);
    if (!mission) throw notFound('Missão não encontrada.');
    if (mission.tipo !== 'quiz') throw conflict('Questões só podem ser adicionadas a missões do tipo quiz.');
    const input = parse(schemas.questao, req.body);
    validateAnswerIndex(input);
    const question = await QuestaoMissao.create({ ...input, id_missao: missionId });
    return res.status(201).json({ dados: question });
  },
  update: async (req, res) => {
    const input = parse(questionPatchSchema, req.body);
    const question = await QuestaoMissao.findByPk(positiveId(req.params.id, 'id_questao'));
    if (!question) throw notFound('Questão não encontrada.');
    validateAnswerIndex({ ...question.toJSON(), ...input });
    await question.update(input);
    return res.json({ dados: question });
  },
  remove: async (req, res) => {
    const question = await QuestaoMissao.findByPk(positiveId(req.params.id, 'id_questao'));
    if (!question) throw notFound('Questão não encontrada.');
    const mission = await Missao.findByPk(question.id_missao);
    const questionCount = await QuestaoMissao.count({ where: { id_missao: question.id_missao } });
    if (mission?.status === 'publicada' && mission.tipo === 'quiz' && questionCount <= 1) {
      throw conflict('Um quiz publicado precisa ter pelo menos uma questão. Arquive a missão antes de remover a última questão.');
    }
    await question.destroy();
    return res.status(204).end();
  },
};

module.exports = { adminQuestionsController };
