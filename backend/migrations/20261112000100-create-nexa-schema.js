'use strict';

const { DataTypes } = require('sequelize');

const timestamps = () => ({
  criado_em: { type: DataTypes.DATE, allowNull: false },
  atualizado_em: { type: DataTypes.DATE, allowNull: false },
});

const fk = (table, key, onDelete = 'RESTRICT') => ({
  type: DataTypes.INTEGER.UNSIGNED,
  allowNull: false,
  references: { model: table, key },
  onUpdate: 'CASCADE',
  onDelete,
});

async function addIndex(queryInterface, table, fields, options = {}) {
  await queryInterface.addIndex(table, fields, options);
}

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('empresas', {
      id_empresa: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
      nome: { type: DataTypes.STRING(120), allowNull: false },
      descricao: { type: DataTypes.TEXT, allowNull: true },
      ano_fundacao: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: true },
      slogan: { type: DataTypes.STRING(240), allowNull: true },
      ...timestamps(),
    });

    await queryInterface.createTable('jogos', {
      id_jogo: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
      id_empresa: fk('empresas', 'id_empresa'),
      slug: { type: DataTypes.STRING(100), allowNull: false },
      nome: { type: DataTypes.STRING(120), allowNull: false },
      descricao: { type: DataTypes.TEXT, allowNull: true },
      genero: { type: DataTypes.STRING(80), allowNull: true },
      plataforma: { type: DataTypes.STRING(120), allowNull: true },
      status: { type: DataTypes.ENUM('ativo', 'inativo'), allowNull: false, defaultValue: 'ativo' },
      ...timestamps(),
    });

    await queryInterface.createTable('usuarios', {
      id_usuario: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
      nome_jogador: { type: DataTypes.STRING(40), allowNull: false },
      email: { type: DataTypes.STRING(254), allowNull: false },
      senha_hash: { type: DataTypes.STRING(100), allowNull: false },
      papel: { type: DataTypes.ENUM('jogador', 'admin'), allowNull: false, defaultValue: 'jogador' },
      status: { type: DataTypes.ENUM('ativo', 'suspenso'), allowNull: false, defaultValue: 'ativo' },
      token_version: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      excluido_em: { type: DataTypes.DATE, allowNull: true },
      ...timestamps(),
    });

    await queryInterface.createTable('jornadas', {
      id_jornada: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
      id_jogo: fk('jogos', 'id_jogo'),
      slug: { type: DataTypes.STRING(100), allowNull: false },
      titulo: { type: DataTypes.STRING(120), allowNull: false },
      descricao: { type: DataTypes.TEXT, allowNull: true },
      ordem_jornada: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
      nivel_minimo: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
      status: { type: DataTypes.ENUM('rascunho', 'publicada', 'arquivada'), allowNull: false, defaultValue: 'rascunho' },
      ...timestamps(),
    });

    await queryInterface.createTable('missoes', {
      id_missao: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
      id_jornada: fk('jornadas', 'id_jornada'),
      slug: { type: DataTypes.STRING(100), allowNull: false },
      titulo: { type: DataTypes.STRING(120), allowNull: false },
      descricao: { type: DataTypes.TEXT, allowNull: true },
      ordem_missao: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
      tipo: { type: DataTypes.ENUM('quiz', 'confirmacao'), allowNull: false, defaultValue: 'confirmacao' },
      nota_minima: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 100 },
      xp_recompensa: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      nivel_minimo: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
      status: { type: DataTypes.ENUM('rascunho', 'publicada', 'arquivada'), allowNull: false, defaultValue: 'rascunho' },
      ...timestamps(),
    });

    await queryInterface.createTable('questoes_missao', {
      id_questao: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
      id_missao: fk('missoes', 'id_missao', 'CASCADE'),
      enunciado: { type: DataTypes.STRING(1000), allowNull: false },
      opcoes: { type: DataTypes.JSON, allowNull: false },
      indice_resposta: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false },
      ordem_questao: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      ...timestamps(),
    });

    await queryInterface.createTable('progresso_usuarios', {
      id_progresso: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
      id_usuario: fk('usuarios', 'id_usuario', 'CASCADE'),
      id_missao: fk('missoes', 'id_missao'),
      status: { type: DataTypes.ENUM('iniciada', 'concluida'), allowNull: false, defaultValue: 'iniciada' },
      iniciada_em: { type: DataTypes.DATE, allowNull: false },
      concluida_em: { type: DataTypes.DATE, allowNull: true },
      xp_obtido: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      ...timestamps(),
    });

    await queryInterface.createTable('desafios', {
      id_desafio: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
      id_jogo: fk('jogos', 'id_jogo'),
      id_missao: fk('missoes', 'id_missao'),
      slug: { type: DataTypes.STRING(100), allowNull: false },
      titulo: { type: DataTypes.STRING(120), allowNull: false },
      descricao: { type: DataTypes.TEXT, allowNull: true },
      xp_bonus: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      inicia_em: { type: DataTypes.DATE, allowNull: false },
      termina_em: { type: DataTypes.DATE, allowNull: false },
      status: { type: DataTypes.ENUM('rascunho', 'ativo', 'encerrado'), allowNull: false, defaultValue: 'rascunho' },
      ...timestamps(),
    });

    await queryInterface.createTable('participacoes_desafio', {
      id_participacao: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
      id_usuario: fk('usuarios', 'id_usuario', 'CASCADE'),
      id_desafio: fk('desafios', 'id_desafio', 'CASCADE'),
      status: { type: DataTypes.ENUM('iniciada', 'concluida'), allowNull: false, defaultValue: 'iniciada' },
      iniciada_em: { type: DataTypes.DATE, allowNull: false },
      concluida_em: { type: DataTypes.DATE, allowNull: true },
      xp_obtido: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      ...timestamps(),
    });

    await queryInterface.createTable('niveis', {
      id_nivel: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
      numero_nivel: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      titulo: { type: DataTypes.STRING(80), allowNull: false },
      xp_minimo: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      ...timestamps(),
    });

    await queryInterface.createTable('conquistas', {
      id_conquista: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
      codigo: { type: DataTypes.STRING(100), allowNull: false },
      titulo: { type: DataTypes.STRING(100), allowNull: false },
      descricao: { type: DataTypes.STRING(500), allowNull: false },
      criterio: { type: DataTypes.ENUM('missoes_concluidas', 'jornadas_concluidas', 'desafios_concluidos', 'xp_total'), allowNull: false },
      meta: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      icone: { type: DataTypes.STRING(500), allowNull: true },
      status: { type: DataTypes.ENUM('ativo', 'inativo'), allowNull: false, defaultValue: 'ativo' },
      ...timestamps(),
    });

    await queryInterface.createTable('usuarios_conquistas', {
      id_usuario: { ...fk('usuarios', 'id_usuario', 'CASCADE'), primaryKey: true },
      id_conquista: { ...fk('conquistas', 'id_conquista', 'CASCADE'), primaryKey: true },
      conquistada_em: { type: DataTypes.DATE, allowNull: false },
      ...timestamps(),
    });

    await queryInterface.createTable('conteudos', {
      id_conteudo: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
      id_jogo: fk('jogos', 'id_jogo'),
      slug: { type: DataTypes.STRING(100), allowNull: false },
      titulo: { type: DataTypes.STRING(120), allowNull: false },
      resumo: { type: DataTypes.STRING(500), allowNull: true },
      tipo: { type: DataTypes.ENUM('artigo', 'video', 'bonus'), allowNull: false },
      corpo: { type: DataTypes.TEXT, allowNull: true },
      url: { type: DataTypes.STRING(2000), allowNull: true },
      nivel_minimo: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
      xp_minimo: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      status: { type: DataTypes.ENUM('ativo', 'inativo'), allowNull: false, defaultValue: 'ativo' },
      ...timestamps(),
    });

    await queryInterface.createTable('compartilhamentos', {
      id_compartilhamento: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
      id_usuario: fk('usuarios', 'id_usuario', 'CASCADE'),
      id_conquista: fk('conquistas', 'id_conquista', 'CASCADE'),
      token: { type: DataTypes.STRING(64), allowNull: false },
      expira_em: { type: DataTypes.DATE, allowNull: true },
      revogado_em: { type: DataTypes.DATE, allowNull: true },
      ...timestamps(),
    });

    await addIndex(queryInterface, 'jogos', ['slug'], { unique: true, name: 'uq_jogos_slug' });
    await addIndex(queryInterface, 'jogos', ['id_empresa'], { name: 'ix_jogos_empresa' });
    await addIndex(queryInterface, 'usuarios', ['email'], { unique: true, name: 'uq_usuarios_email' });
    await addIndex(queryInterface, 'usuarios', ['papel', 'status'], { name: 'ix_usuarios_papel_status' });
    await addIndex(queryInterface, 'jornadas', ['id_jogo', 'slug'], { unique: true, name: 'uq_jornadas_jogo_slug' });
    await addIndex(queryInterface, 'jornadas', ['id_jogo', 'status', 'ordem_jornada'], { name: 'ix_jornadas_publicacao' });
    await addIndex(queryInterface, 'missoes', ['id_jornada', 'slug'], { unique: true, name: 'uq_missoes_jornada_slug' });
    await addIndex(queryInterface, 'missoes', ['id_jornada', 'status', 'ordem_missao'], { name: 'ix_missoes_publicacao' });
    await addIndex(queryInterface, 'questoes_missao', ['id_missao', 'ordem_questao'], { unique: true, name: 'uq_questoes_missao_ordem' });
    await addIndex(queryInterface, 'progresso_usuarios', ['id_usuario', 'id_missao'], { unique: true, name: 'uq_progresso_usuario_missao' });
    await addIndex(queryInterface, 'progresso_usuarios', ['id_usuario', 'status'], { name: 'ix_progresso_usuario_status' });
    await addIndex(queryInterface, 'desafios', ['id_jogo', 'slug'], { unique: true, name: 'uq_desafios_jogo_slug' });
    await addIndex(queryInterface, 'desafios', ['status', 'inicia_em', 'termina_em'], { name: 'ix_desafios_periodo' });
    await addIndex(queryInterface, 'participacoes_desafio', ['id_usuario', 'id_desafio'], { unique: true, name: 'uq_participacoes_usuario_desafio' });
    await addIndex(queryInterface, 'niveis', ['numero_nivel'], { unique: true, name: 'uq_niveis_numero' });
    await addIndex(queryInterface, 'niveis', ['xp_minimo'], { unique: true, name: 'uq_niveis_xp' });
    await addIndex(queryInterface, 'conquistas', ['codigo'], { unique: true, name: 'uq_conquistas_codigo' });
    await addIndex(queryInterface, 'conquistas', ['criterio', 'meta', 'status'], { name: 'ix_conquistas_criterio' });
    await addIndex(queryInterface, 'usuarios_conquistas', ['id_conquista', 'conquistada_em'], { name: 'ix_usuarios_conquistas_conquista' });
    await addIndex(queryInterface, 'conteudos', ['id_jogo', 'slug'], { unique: true, name: 'uq_conteudos_jogo_slug' });
    await addIndex(queryInterface, 'conteudos', ['id_jogo', 'status', 'nivel_minimo'], { name: 'ix_conteudos_desbloqueio' });
    await addIndex(queryInterface, 'compartilhamentos', ['token'], { unique: true, name: 'uq_compartilhamentos_token' });
    await addIndex(queryInterface, 'compartilhamentos', ['id_usuario', 'id_conquista'], { name: 'ix_compartilhamentos_usuario_conquista' });
  },

  async down(queryInterface) {
    for (const table of [
      'compartilhamentos', 'conteudos', 'usuarios_conquistas', 'conquistas', 'niveis',
      'participacoes_desafio', 'desafios', 'progresso_usuarios', 'questoes_missao',
      'missoes', 'jornadas', 'usuarios', 'jogos', 'empresas',
    ]) {
      await queryInterface.dropTable(table);
    }
  },
};
