const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const common = {
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em',
  underscored: true,
};

const Empresa = sequelize.define('Empresa', {
  id_empresa: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(120), allowNull: false },
  descricao: { type: DataTypes.TEXT, allowNull: true },
  ano_fundacao: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: true },
  slogan: { type: DataTypes.STRING(240), allowNull: true },
}, { ...common, tableName: 'empresas' });

const Jogo = sequelize.define('Jogo', {
  id_jogo: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  id_empresa: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  slug: { type: DataTypes.STRING(100), allowNull: false },
  nome: { type: DataTypes.STRING(120), allowNull: false },
  descricao: { type: DataTypes.TEXT, allowNull: true },
  genero: { type: DataTypes.STRING(80), allowNull: true },
  plataforma: { type: DataTypes.STRING(120), allowNull: true },
  status: { type: DataTypes.ENUM('ativo', 'inativo'), allowNull: false, defaultValue: 'ativo' },
}, {
  ...common, tableName: 'jogos',
  indexes: [{ unique: true, fields: ['slug'] }, { fields: ['id_empresa'] }],
});

const Usuario = sequelize.define('Usuario', {
  id_usuario: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  nome_jogador: { type: DataTypes.STRING(40), allowNull: false },
  email: { type: DataTypes.STRING(254), allowNull: false },
  senha_hash: { type: DataTypes.STRING(100), allowNull: false },
  papel: { type: DataTypes.ENUM('jogador', 'admin'), allowNull: false, defaultValue: 'jogador' },
  status: { type: DataTypes.ENUM('ativo', 'suspenso'), allowNull: false, defaultValue: 'ativo' },
  token_version: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
  excluido_em: { type: DataTypes.DATE, allowNull: true },
}, {
  ...common, tableName: 'usuarios', paranoid: true, deletedAt: 'excluido_em',
  indexes: [{ unique: true, fields: ['email'] }, { fields: ['papel', 'status'] }],
});

const Jornada = sequelize.define('Jornada', {
  id_jornada: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  id_jogo: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  slug: { type: DataTypes.STRING(100), allowNull: false },
  titulo: { type: DataTypes.STRING(120), allowNull: false },
  descricao: { type: DataTypes.TEXT, allowNull: true },
  ordem_jornada: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
  nivel_minimo: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
  status: { type: DataTypes.ENUM('rascunho', 'publicada', 'arquivada'), allowNull: false, defaultValue: 'rascunho' },
}, {
  ...common, tableName: 'jornadas',
  indexes: [
    { unique: true, fields: ['id_jogo', 'slug'] },
    { fields: ['id_jogo', 'status', 'ordem_jornada'] },
  ],
});

const Missao = sequelize.define('Missao', {
  id_missao: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  id_jornada: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  slug: { type: DataTypes.STRING(100), allowNull: false },
  titulo: { type: DataTypes.STRING(120), allowNull: false },
  descricao: { type: DataTypes.TEXT, allowNull: true },
  ordem_missao: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
  tipo: { type: DataTypes.ENUM('quiz', 'confirmacao'), allowNull: false, defaultValue: 'confirmacao' },
  nota_minima: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 100 },
  xp_recompensa: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
  nivel_minimo: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
  status: { type: DataTypes.ENUM('rascunho', 'publicada', 'arquivada'), allowNull: false, defaultValue: 'rascunho' },
}, {
  ...common, tableName: 'missoes',
  indexes: [
    { unique: true, fields: ['id_jornada', 'slug'] },
    { fields: ['id_jornada', 'status', 'ordem_missao'] },
  ],
});

const QuestaoMissao = sequelize.define('QuestaoMissao', {
  id_questao: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  id_missao: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  enunciado: { type: DataTypes.STRING(1000), allowNull: false },
  opcoes: { type: DataTypes.JSON, allowNull: false },
  indice_resposta: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false },
  ordem_questao: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
}, {
  ...common, tableName: 'questoes_missao',
  indexes: [{ unique: true, fields: ['id_missao', 'ordem_questao'] }],
});

const ProgressoUsuario = sequelize.define('ProgressoUsuario', {
  id_progresso: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  id_missao: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  status: { type: DataTypes.ENUM('iniciada', 'concluida'), allowNull: false, defaultValue: 'iniciada' },
  iniciada_em: { type: DataTypes.DATE, allowNull: false },
  concluida_em: { type: DataTypes.DATE, allowNull: true },
  xp_obtido: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
}, {
  ...common, tableName: 'progresso_usuarios',
  indexes: [
    { unique: true, fields: ['id_usuario', 'id_missao'] },
    { fields: ['id_usuario', 'status'] },
    { fields: ['id_missao', 'status'] },
  ],
});

const Desafio = sequelize.define('Desafio', {
  id_desafio: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  id_jogo: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  id_missao: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  slug: { type: DataTypes.STRING(100), allowNull: false },
  titulo: { type: DataTypes.STRING(120), allowNull: false },
  descricao: { type: DataTypes.TEXT, allowNull: true },
  xp_bonus: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
  inicia_em: { type: DataTypes.DATE, allowNull: false },
  termina_em: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('rascunho', 'ativo', 'encerrado'), allowNull: false, defaultValue: 'rascunho' },
}, {
  ...common, tableName: 'desafios',
  indexes: [{ unique: true, fields: ['id_jogo', 'slug'] }, { fields: ['status', 'inicia_em', 'termina_em'] }],
});

const ParticipacaoDesafio = sequelize.define('ParticipacaoDesafio', {
  id_participacao: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  id_desafio: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  status: { type: DataTypes.ENUM('iniciada', 'concluida'), allowNull: false, defaultValue: 'iniciada' },
  iniciada_em: { type: DataTypes.DATE, allowNull: false },
  concluida_em: { type: DataTypes.DATE, allowNull: true },
  xp_obtido: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
}, {
  ...common, tableName: 'participacoes_desafio',
  indexes: [{ unique: true, fields: ['id_usuario', 'id_desafio'] }, { fields: ['id_usuario', 'status'] }],
});

const Nivel = sequelize.define('Nivel', {
  id_nivel: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  numero_nivel: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  titulo: { type: DataTypes.STRING(80), allowNull: false },
  xp_minimo: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
}, { ...common, tableName: 'niveis', indexes: [{ unique: true, fields: ['xp_minimo'] }] });

const Conquista = sequelize.define('Conquista', {
  id_conquista: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  codigo: { type: DataTypes.STRING(100), allowNull: false },
  titulo: { type: DataTypes.STRING(100), allowNull: false },
  descricao: { type: DataTypes.STRING(500), allowNull: false },
  criterio: { type: DataTypes.ENUM('missoes_concluidas', 'jornadas_concluidas', 'desafios_concluidos', 'xp_total'), allowNull: false },
  meta: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  icone: { type: DataTypes.STRING(500), allowNull: true },
  status: { type: DataTypes.ENUM('ativo', 'inativo'), allowNull: false, defaultValue: 'ativo' },
}, { ...common, tableName: 'conquistas', indexes: [{ unique: true, fields: ['codigo'] }, { fields: ['criterio', 'meta', 'status'] }] });

const UsuarioConquista = sequelize.define('UsuarioConquista', {
  id_usuario: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
  id_conquista: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
  conquistada_em: { type: DataTypes.DATE, allowNull: false },
}, {
  ...common, tableName: 'usuarios_conquistas',
  indexes: [{ unique: true, fields: ['id_usuario', 'id_conquista'] }, { fields: ['id_conquista', 'conquistada_em'] }],
});

const Conteudo = sequelize.define('Conteudo', {
  id_conteudo: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  id_jogo: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  slug: { type: DataTypes.STRING(100), allowNull: false },
  titulo: { type: DataTypes.STRING(120), allowNull: false },
  resumo: { type: DataTypes.STRING(500), allowNull: true },
  tipo: { type: DataTypes.ENUM('artigo', 'video', 'bonus'), allowNull: false },
  corpo: { type: DataTypes.TEXT, allowNull: true },
  url: { type: DataTypes.STRING(2000), allowNull: true },
  nivel_minimo: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
  xp_minimo: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.ENUM('ativo', 'inativo'), allowNull: false, defaultValue: 'ativo' },
}, {
  ...common, tableName: 'conteudos',
  indexes: [{ unique: true, fields: ['id_jogo', 'slug'] }, { fields: ['id_jogo', 'status', 'nivel_minimo'] }],
});

const Compartilhamento = sequelize.define('Compartilhamento', {
  id_compartilhamento: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  id_conquista: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  token: { type: DataTypes.STRING(64), allowNull: false },
  expira_em: { type: DataTypes.DATE, allowNull: true },
  revogado_em: { type: DataTypes.DATE, allowNull: true },
}, {
  ...common, tableName: 'compartilhamentos',
  indexes: [{ unique: true, fields: ['token'] }, { fields: ['id_usuario', 'id_conquista'] }],
});

Empresa.hasMany(Jogo, { foreignKey: 'id_empresa', as: 'jogos' });
Jogo.belongsTo(Empresa, { foreignKey: 'id_empresa', as: 'empresa' });
Jogo.hasMany(Jornada, { foreignKey: 'id_jogo', as: 'jornadas' });
Jornada.belongsTo(Jogo, { foreignKey: 'id_jogo', as: 'jogo' });
Jornada.hasMany(Missao, { foreignKey: 'id_jornada', as: 'missoes' });
Missao.belongsTo(Jornada, { foreignKey: 'id_jornada', as: 'jornada' });
Missao.hasMany(QuestaoMissao, { foreignKey: 'id_missao', as: 'questoes' });
QuestaoMissao.belongsTo(Missao, { foreignKey: 'id_missao', as: 'missao' });
Missao.hasMany(ProgressoUsuario, { foreignKey: 'id_missao', as: 'progresso' });
ProgressoUsuario.belongsTo(Missao, { foreignKey: 'id_missao', as: 'missao' });
Usuario.hasMany(ProgressoUsuario, { foreignKey: 'id_usuario', as: 'progresso' });
ProgressoUsuario.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
Jogo.hasMany(Desafio, { foreignKey: 'id_jogo', as: 'desafios' });
Desafio.belongsTo(Jogo, { foreignKey: 'id_jogo', as: 'jogo' });
Missao.hasMany(Desafio, { foreignKey: 'id_missao', as: 'desafios' });
Desafio.belongsTo(Missao, { foreignKey: 'id_missao', as: 'missao' });
Usuario.hasMany(ParticipacaoDesafio, { foreignKey: 'id_usuario', as: 'participacoes_desafio' });
ParticipacaoDesafio.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
Desafio.hasMany(ParticipacaoDesafio, { foreignKey: 'id_desafio', as: 'participacoes' });
ParticipacaoDesafio.belongsTo(Desafio, { foreignKey: 'id_desafio', as: 'desafio' });
Usuario.belongsToMany(Conquista, { through: UsuarioConquista, foreignKey: 'id_usuario', otherKey: 'id_conquista', as: 'conquistas' });
Conquista.belongsToMany(Usuario, { through: UsuarioConquista, foreignKey: 'id_conquista', otherKey: 'id_usuario', as: 'usuarios' });
UsuarioConquista.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
UsuarioConquista.belongsTo(Conquista, { foreignKey: 'id_conquista', as: 'conquista' });
Jogo.hasMany(Conteudo, { foreignKey: 'id_jogo', as: 'conteudos' });
Conteudo.belongsTo(Jogo, { foreignKey: 'id_jogo', as: 'jogo' });
Usuario.hasMany(Compartilhamento, { foreignKey: 'id_usuario', as: 'compartilhamentos' });
Compartilhamento.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
Conquista.hasMany(Compartilhamento, { foreignKey: 'id_conquista', as: 'compartilhamentos' });
Compartilhamento.belongsTo(Conquista, { foreignKey: 'id_conquista', as: 'conquista' });

module.exports = {
  sequelize, Empresa, Jogo, Usuario, Jornada, Missao, QuestaoMissao, ProgressoUsuario,
  Desafio, ParticipacaoDesafio, Nivel, Conquista, UsuarioConquista, Conteudo, Compartilhamento,
};

