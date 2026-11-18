const { Op } = require('sequelize');
const {
  Empresa, Jogo, Jornada, Missao, Desafio, Nivel, Conquista, Conteudo,
  QuestaoMissao,
} = require('../models');
const { schemas, partial } = require('../validators/catalog');
const { parse, positiveId } = require('../utils/validation');
const { pagination, searchWhere } = require('../utils/serializers');
const { notFound, conflict, badRequest } = require('../utils/errors');

const resources = {
  empresas: { model: Empresa, schema: schemas.empresa, id: 'id_empresa', searchable: ['nome', 'descricao', 'slogan'] },
  jogos: { model: Jogo, schema: schemas.jogo, id: 'id_jogo', searchable: ['nome', 'descricao', 'genero', 'plataforma'], publicWhere: { status: 'ativo' } },
  jornadas: {
    model: Jornada, schema: schemas.jornada, id: 'id_jornada', searchable: ['titulo', 'descricao', 'slug'],
    publicWhere: { status: 'publicada' }, filters: ['id_jogo'],
    publicInclude: [{ model: Jogo, as: 'jogo', attributes: [], where: { status: 'ativo' }, required: true }],
  },
  missoes: {
    model: Missao, schema: schemas.missao, id: 'id_missao', searchable: ['titulo', 'descricao', 'slug'],
    publicWhere: { status: 'publicada' }, filters: ['id_jornada'],
    publicInclude: [{
      model: Jornada, as: 'jornada', attributes: [], where: { status: 'publicada' }, required: true,
      include: [{ model: Jogo, as: 'jogo', attributes: [], where: { status: 'ativo' }, required: true }],
    }],
  },
  desafios: {
    model: Desafio, schema: schemas.desafio, id: 'id_desafio', searchable: ['titulo', 'descricao', 'slug'],
    publicWhere: () => ({ status: 'ativo', inicia_em: { [Op.lte]: new Date() }, termina_em: { [Op.gte]: new Date() } }), filters: ['id_jogo'],
    publicInclude: [{ model: Jogo, as: 'jogo', attributes: [], where: { status: 'ativo' }, required: true }],
  },
  niveis: { model: Nivel, schema: schemas.nivel, id: 'id_nivel', searchable: ['titulo'] },
  conquistas: { model: Conquista, schema: schemas.conquista, id: 'id_conquista', searchable: ['titulo', 'descricao', 'codigo'], publicWhere: { status: 'ativo' } },
  conteudos: { model: Conteudo, schema: schemas.conteudo, id: 'id_conteudo', searchable: ['titulo', 'resumo', 'slug'], publicWhere: { status: 'ativo' }, filters: ['id_jogo'], playerOnly: true },
};

function buildWhere(resource, query, isAdmin) {
  const publicFilter = typeof resource.publicWhere === 'function' ? resource.publicWhere() : (resource.publicWhere || {});
  const where = isAdmin ? {} : { ...publicFilter };
  Object.assign(where, searchWhere(query, resource.searchable || []));
  for (const field of resource.filters || []) {
    if (query[field] !== undefined) where[field] = positiveId(query[field], field);
  }
  return where;
}

function createCatalogController() {
  const controller = {};

  for (const [name, resource] of Object.entries(resources)) {
    const model = resource.model;
    controller[name] = {
      publicList: async (req, res) => {
        const { pagina, limite, offset } = pagination(req.query);
        const include = resource.publicInclude || [];
        const { rows, count } = await model.findAndCountAll({
          where: buildWhere(resource, req.query, false),
          include,
          distinct: true,
          order: [[resource.id, 'ASC']],
          limit: limite,
          offset,
        });
        return res.json({
          dados: rows,
          paginacao: { pagina, limite, total: count, paginas: Math.ceil(count / limite) },
        });
      },
      publicGet: async (req, res) => {
        const id = positiveId(req.params.id, resource.id);
        const record = await model.findOne({
          where: { [resource.id]: id, ...buildWhere(resource, {}, false) },
          include: resource.publicInclude || [],
        });
        if (!record) throw notFound('Registro não encontrado.');
        return res.json({ dados: record });
      },
      adminList: async (req, res) => {
        const { pagina, limite, offset } = pagination(req.query);
        const { rows, count } = await model.findAndCountAll({
          where: buildWhere(resource, req.query, true),
          order: [[resource.id, 'ASC']],
          limit: limite,
          offset,
        });
        return res.json({ dados: rows, paginacao: { pagina, limite, total: count, paginas: Math.ceil(count / limite) } });
      },
      adminGet: async (req, res) => {
        const record = await model.findByPk(positiveId(req.params.id, resource.id));
        if (!record) throw notFound('Registro não encontrado.');
        return res.json({ dados: record });
      },
      create: async (req, res) => {
        const input = parse(resource.schema, req.body);
        await validateResource(name, input);
        const record = await model.create(input);
        return res.status(201).json({ dados: record });
      },
      update: async (req, res) => {
        const input = parse(partial(resource.schema).refine((value) => Object.keys(value).length > 0, 'Informe ao menos um campo.'), req.body);
        const record = await model.findByPk(positiveId(req.params.id, resource.id));
        if (!record) throw notFound('Registro não encontrado.');
        await validateResource(name, { ...record.toJSON(), ...input }, record);
        await record.update(input);
        return res.json({ dados: record });
      },
      remove: async (req, res) => {
        const record = await model.findByPk(positiveId(req.params.id, resource.id));
        if (!record) throw notFound('Registro não encontrado.');
        if (name === 'niveis' && record.numero_nivel === 1) {
          throw conflict('O nível inicial é necessário para calcular o progresso dos jogadores.');
        }
        await record.destroy();
        return res.status(204).end();
      },
    };
  }

  controller.journeyMissions = async (req, res) => {
    const journeyId = positiveId(req.params.id, 'id_jornada');
    const journey = await Jornada.findOne({
      where: { id_jornada: journeyId, status: 'publicada' },
      include: [{ model: Jogo, as: 'jogo', where: { status: 'ativo' }, required: true }],
    });
    if (!journey) throw notFound('Jornada não encontrada.');
    const missions = await Missao.findAll({
      where: { id_jornada: journeyId, status: 'publicada' },
      attributes: ['id_missao', 'slug', 'titulo', 'descricao', 'ordem_missao', 'tipo', 'nota_minima', 'xp_recompensa', 'nivel_minimo'],
      order: [['ordem_missao', 'ASC']],
    });
    return res.json({ dados: missions });
  };

  return controller;
}

async function validateResource(name, input, existing) {
  if (name === 'niveis') {
    const levelNumber = Number(input.numero_nivel);
    const xpMinimum = Number(input.xp_minimo);
    if (existing?.numero_nivel === 1 && levelNumber !== 1) {
      throw conflict('O nível inicial não pode ser renumerado.');
    }
    if (levelNumber === 1 && xpMinimum !== 0) {
      throw badRequest('O nível 1 precisa começar com 0 XP.');
    }
    const previous = await Nivel.findOne({ where: { numero_nivel: { [Op.lt]: levelNumber } }, order: [['numero_nivel', 'DESC']] });
    const next = await Nivel.findOne({ where: { numero_nivel: { [Op.gt]: levelNumber } }, order: [['numero_nivel', 'ASC']] });
    if (previous && Number(previous.xp_minimo) >= xpMinimum) {
      throw badRequest('O limite de XP precisa aumentar conforme o número do nível.');
    }
    if (next && Number(next.xp_minimo) <= xpMinimum) {
      throw badRequest('O limite de XP precisa ficar abaixo do próximo nível.');
    }
  }

  if (name === 'desafios' && new Date(input.termina_em) <= new Date(input.inicia_em)) {
    throw badRequest('A data final do desafio deve ser posterior à data inicial.');
  }

  if (name === 'missoes' && input.status === 'publicada' && input.tipo === 'quiz') {
    if (!existing) throw conflict('Crie o quiz como rascunho, adicione as questões e depois publique a missão.');
    const questionCount = await QuestaoMissao.count({ where: { id_missao: existing.id_missao } });
    if (!questionCount) throw conflict('Cadastre pelo menos uma questão antes de publicar um quiz.');
  }

  if (name === 'desafios') {
    const mission = await Missao.findByPk(input.id_missao, { include: [{ model: Jornada, as: 'jornada' }] });
    if (!mission) throw notFound('Missão vinculada não encontrada.');
    if (mission.jornada.id_jogo !== input.id_jogo) throw badRequest('O jogo do desafio precisa ser o mesmo da missão vinculada.');
    if (input.status === 'ativo' && (mission.status !== 'publicada' || mission.jornada.status !== 'publicada')) {
      throw conflict('Publique a jornada e a missão vinculadas antes de ativar o desafio.');
    }
    if (input.status === 'ativo') {
      const game = await Jogo.findByPk(input.id_jogo);
      if (!game || game.status !== 'ativo') throw conflict('Ative o jogo vinculado antes de ativar o desafio.');
    }
  }

  if (name === 'jornadas' && input.status === 'publicada') {
    const game = await Jogo.findByPk(input.id_jogo);
    if (!game || game.status !== 'ativo') throw conflict('Ative o jogo antes de publicar a jornada.');
  }
}

module.exports = { createCatalogController, resources };
