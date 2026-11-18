'use strict';

const {
  sequelize, Empresa, Jogo, Jornada, Missao, QuestaoMissao, Desafio,
  Nivel, Conquista, Conteudo, UsuarioConquista, Compartilhamento,
} = require('../src/models');

module.exports = {
  async up() {
    try {
      await sequelize.transaction(async (transaction) => {
      const now = new Date();
      const [empresa] = await Empresa.findOrCreate({
        where: { nome: 'Nexa Play' },
        defaults: {
          nome: 'Nexa Play',
          descricao: 'Plataforma de aprendizagem em jogos digitais.',
          slogan: 'Aprenda jogando.',
        },
        transaction,
      });
      const [jogo] = await Jogo.findOrCreate({
        where: { slug: 'nexa-quest' },
        defaults: {
          id_empresa: empresa.id_empresa,
          slug: 'nexa-quest',
          nome: 'Nexa Quest',
          descricao: 'Jornada de demonstração para validar o progresso de jogadores.',
          genero: 'Aventura educativa',
          plataforma: 'Web',
          status: 'ativo',
        },
        transaction,
      });
      const [jornada] = await Jornada.findOrCreate({
        where: { id_jogo: jogo.id_jogo, slug: 'primeiros-passos' },
        defaults: {
          id_jogo: jogo.id_jogo,
          slug: 'primeiros-passos',
          titulo: 'Primeiros passos',
          descricao: 'Uma jornada de demonstração para experimentar o Nexa Play.',
          ordem_jornada: 1,
          nivel_minimo: 1,
          status: 'publicada',
        },
        transaction,
      });
      const [confirmacao] = await Missao.findOrCreate({
        where: { id_jornada: jornada.id_jornada, slug: 'boas-vindas' },
        defaults: {
          id_jornada: jornada.id_jornada,
          slug: 'boas-vindas',
          titulo: 'Boas-vindas',
          descricao: 'Confirme que está pronto para começar sua jornada.',
          ordem_missao: 1,
          tipo: 'confirmacao',
          nota_minima: 100,
          xp_recompensa: 50,
          nivel_minimo: 1,
          status: 'publicada',
        },
        transaction,
      });
      const [quiz] = await Missao.findOrCreate({
        where: { id_jornada: jornada.id_jornada, slug: 'conhecendo-a-plataforma' },
        defaults: {
          id_jornada: jornada.id_jornada,
          slug: 'conhecendo-a-plataforma',
          titulo: 'Conhecendo a plataforma',
          descricao: 'Questão de demonstração para verificar a conclusão de quizzes.',
          ordem_missao: 2,
          tipo: 'quiz',
          nota_minima: 100,
          xp_recompensa: 100,
          nivel_minimo: 1,
          status: 'rascunho',
        },
        transaction,
      });
      await QuestaoMissao.findOrCreate({
        where: { id_missao: quiz.id_missao, ordem_questao: 1 },
        defaults: {
          id_missao: quiz.id_missao,
          enunciado: 'Qual é a ação usada para registrar sua entrada em uma missão?',
          opcoes: ['Iniciar missão', 'Compartilhar conquista', 'Alterar perfil'],
          indice_resposta: 0,
          ordem_questao: 1,
        },
        transaction,
      });
      quiz.status = 'publicada';
      await quiz.save({ transaction });

      for (const level of [
        [1, 'Iniciante', 0], [2, 'Explorador', 100], [3, 'Aventureiro', 250],
        [4, 'Estrategista', 450], [5, 'Especialista', 700], [6, 'Veterano', 1000],
        [7, 'Mestre', 1400], [8, 'Lenda', 1900], [9, 'Ícone', 2500], [10, 'Nexa', 3200],
      ]) {
        await Nivel.findOrCreate({
          where: { numero_nivel: level[0] },
          defaults: { numero_nivel: level[0], titulo: level[1], xp_minimo: level[2] },
          transaction,
        });
      }

      await Conquista.findOrCreate({
        where: { codigo: 'primeira-missao' },
        defaults: {
          codigo: 'primeira-missao',
          titulo: 'Primeira missão',
          descricao: 'Conclua sua primeira missão.',
          criterio: 'missoes_concluidas',
          meta: 1,
          status: 'ativo',
        },
        transaction,
      });
      await Conquista.findOrCreate({
        where: { codigo: 'cem-de-xp' },
        defaults: {
          codigo: 'cem-de-xp',
          titulo: 'Primeiros 100 XP',
          descricao: 'Acumule 100 pontos de experiência.',
          criterio: 'xp_total',
          meta: 100,
          status: 'ativo',
        },
        transaction,
      });

      await Conteudo.findOrCreate({
        where: { id_jogo: jogo.id_jogo, slug: 'conteudo-de-demonstracao' },
        defaults: {
          id_jogo: jogo.id_jogo,
          slug: 'conteudo-de-demonstracao',
          titulo: 'Conteúdo liberado por nível',
          resumo: 'Exemplo de material que o backend libera conforme o progresso.',
          tipo: 'artigo',
          corpo: 'Este texto aparece para jogadores que alcançaram o nível 2 e pelo menos 100 XP.',
          nivel_minimo: 2,
          xp_minimo: 100,
          status: 'ativo',
        },
        transaction,
      });
      await Desafio.findOrCreate({
        where: { id_jogo: jogo.id_jogo, slug: 'semana-de-boas-vindas' },
        defaults: {
          id_jogo: jogo.id_jogo,
          id_missao: confirmacao.id_missao,
          slug: 'semana-de-boas-vindas',
          titulo: 'Desafio de boas-vindas',
          descricao: 'Conclua a missão de boas-vindas durante o período do desafio.',
          xp_bonus: 25,
          inicia_em: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          termina_em: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
          status: 'ativo',
        },
        transaction,
      });
      });
    } finally {
      await sequelize.close();
    }
  },

  async down() {
    try {
      await sequelize.transaction(async (transaction) => {
      const empresa = await Empresa.findOne({ where: { nome: 'Nexa Play' }, transaction });
      const jogo = await Jogo.findOne({ where: { slug: 'nexa-quest' }, transaction });
      const jornada = jogo ? await Jornada.findOne({ where: { id_jogo: jogo.id_jogo, slug: 'primeiros-passos' }, transaction }) : null;
      const missaoIds = jornada
        ? (await Missao.findAll({ where: { id_jornada: jornada.id_jornada, slug: ['boas-vindas', 'conhecendo-a-plataforma'] }, attributes: ['id_missao'], transaction })).map((row) => row.id_missao)
        : [];
      const badgeIds = (await Conquista.findAll({ where: { codigo: ['primeira-missao', 'cem-de-xp'] }, attributes: ['id_conquista'], transaction })).map((row) => row.id_conquista);

      if (badgeIds.length) {
        await Compartilhamento.destroy({ where: { id_conquista: badgeIds }, force: true, transaction });
        await UsuarioConquista.destroy({ where: { id_conquista: badgeIds }, force: true, transaction });
      }
      if (jogo) {
        await Desafio.destroy({ where: { id_jogo: jogo.id_jogo, slug: 'semana-de-boas-vindas' }, force: true, transaction });
        await Conteudo.destroy({ where: { id_jogo: jogo.id_jogo, slug: 'conteudo-de-demonstracao' }, force: true, transaction });
      }
      if (missaoIds.length) {
        await QuestaoMissao.destroy({ where: { id_missao: missaoIds }, force: true, transaction });
        await Missao.destroy({ where: { id_missao: missaoIds }, force: true, transaction });
      }
      if (jornada) await jornada.destroy({ force: true, transaction });
      if (jogo) {
        const otherGames = await Jogo.count({ where: { id_empresa: jogo.id_empresa }, transaction });
        await jogo.destroy({ force: true, transaction });
        if (otherGames <= 1) await Empresa.destroy({ where: { id_empresa: jogo.id_empresa }, force: true, transaction });
      } else if (empresa) {
        const gameCount = await Jogo.count({ where: { id_empresa: empresa.id_empresa }, transaction });
        if (!gameCount) await empresa.destroy({ force: true, transaction });
      }
      await Conquista.destroy({ where: { codigo: ['primeira-missao', 'cem-de-xp'] }, force: true, transaction });
      await Nivel.destroy({ where: { numero_nivel: { [require('sequelize').Op.between]: [1, 10] } }, force: true, transaction });
      });
    } finally {
      await sequelize.close();
    }
  },
};
