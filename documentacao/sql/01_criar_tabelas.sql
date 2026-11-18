-- PostgreSQL: execute somente em um banco vazio. Não recria nem apaga dados.
-- Os nomes dos tipos enum acompanham os criados pelo Sequelize.
BEGIN;
CREATE TYPE "enum_jogos_status" AS ENUM ('ativo','inativo');
CREATE TYPE "enum_usuarios_papel" AS ENUM ('jogador','admin');
CREATE TYPE "enum_usuarios_status" AS ENUM ('ativo','suspenso');
CREATE TYPE "enum_jornadas_status" AS ENUM ('rascunho','publicada','arquivada');
CREATE TYPE "enum_missoes_tipo" AS ENUM ('quiz','confirmacao');
CREATE TYPE "enum_missoes_status" AS ENUM ('rascunho','publicada','arquivada');
CREATE TYPE "enum_progresso_usuarios_status" AS ENUM ('iniciada','concluida');
CREATE TYPE "enum_desafios_status" AS ENUM ('rascunho','ativo','encerrado');
CREATE TYPE "enum_participacoes_desafio_status" AS ENUM ('iniciada','concluida');
CREATE TYPE "enum_conquistas_criterio" AS ENUM ('missoes_concluidas','jornadas_concluidas','desafios_concluidos','xp_total');
CREATE TYPE "enum_conquistas_status" AS ENUM ('ativo','inativo');
CREATE TYPE "enum_conteudos_tipo" AS ENUM ('artigo','video','bonus');
CREATE TYPE "enum_conteudos_status" AS ENUM ('ativo','inativo');

CREATE TABLE empresas (
 id_empresa SERIAL PRIMARY KEY, nome VARCHAR(120) NOT NULL, descricao TEXT,
 ano_fundacao SMALLINT, slogan VARCHAR(240), criado_em TIMESTAMPTZ NOT NULL, atualizado_em TIMESTAMPTZ NOT NULL
);
CREATE TABLE jogos (
 id_jogo SERIAL PRIMARY KEY, id_empresa INTEGER NOT NULL REFERENCES empresas(id_empresa) ON UPDATE CASCADE ON DELETE RESTRICT,
 slug VARCHAR(100) NOT NULL, nome VARCHAR(120) NOT NULL, descricao TEXT, genero VARCHAR(80), plataforma VARCHAR(120),
 status "enum_jogos_status" NOT NULL DEFAULT 'ativo', criado_em TIMESTAMPTZ NOT NULL, atualizado_em TIMESTAMPTZ NOT NULL
);
CREATE TABLE usuarios (
 id_usuario SERIAL PRIMARY KEY, nome_jogador VARCHAR(40) NOT NULL, email VARCHAR(254) NOT NULL,
 senha_hash VARCHAR(100) NOT NULL, papel "enum_usuarios_papel" NOT NULL DEFAULT 'jogador',
 status "enum_usuarios_status" NOT NULL DEFAULT 'ativo', token_version INTEGER NOT NULL DEFAULT 0,
 excluido_em TIMESTAMPTZ, criado_em TIMESTAMPTZ NOT NULL, atualizado_em TIMESTAMPTZ NOT NULL
);
CREATE TABLE jornadas (
 id_jornada SERIAL PRIMARY KEY, id_jogo INTEGER NOT NULL REFERENCES jogos(id_jogo) ON UPDATE CASCADE ON DELETE RESTRICT,
 slug VARCHAR(100) NOT NULL, titulo VARCHAR(120) NOT NULL, descricao TEXT,
 ordem_jornada INTEGER NOT NULL DEFAULT 1, nivel_minimo INTEGER NOT NULL DEFAULT 1,
 status "enum_jornadas_status" NOT NULL DEFAULT 'rascunho', criado_em TIMESTAMPTZ NOT NULL, atualizado_em TIMESTAMPTZ NOT NULL
);
CREATE TABLE missoes (
 id_missao SERIAL PRIMARY KEY, id_jornada INTEGER NOT NULL REFERENCES jornadas(id_jornada) ON UPDATE CASCADE ON DELETE RESTRICT,
 slug VARCHAR(100) NOT NULL, titulo VARCHAR(120) NOT NULL, descricao TEXT, ordem_missao INTEGER NOT NULL DEFAULT 1,
 tipo "enum_missoes_tipo" NOT NULL DEFAULT 'confirmacao', nota_minima DECIMAL(5,2) NOT NULL DEFAULT 100,
 xp_recompensa INTEGER NOT NULL DEFAULT 0, nivel_minimo INTEGER NOT NULL DEFAULT 1,
 status "enum_missoes_status" NOT NULL DEFAULT 'rascunho', criado_em TIMESTAMPTZ NOT NULL, atualizado_em TIMESTAMPTZ NOT NULL
);
CREATE TABLE questoes_missao (
 id_questao SERIAL PRIMARY KEY, id_missao INTEGER NOT NULL REFERENCES missoes(id_missao) ON UPDATE CASCADE ON DELETE CASCADE,
 enunciado VARCHAR(1000) NOT NULL, opcoes JSON NOT NULL, indice_resposta SMALLINT NOT NULL, ordem_questao INTEGER NOT NULL,
 criado_em TIMESTAMPTZ NOT NULL, atualizado_em TIMESTAMPTZ NOT NULL
);
CREATE TABLE progresso_usuarios (
 id_progresso SERIAL PRIMARY KEY, id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
 id_missao INTEGER NOT NULL REFERENCES missoes(id_missao) ON UPDATE CASCADE ON DELETE RESTRICT,
 status "enum_progresso_usuarios_status" NOT NULL DEFAULT 'iniciada', iniciada_em TIMESTAMPTZ NOT NULL,
 concluida_em TIMESTAMPTZ, xp_obtido INTEGER NOT NULL DEFAULT 0, criado_em TIMESTAMPTZ NOT NULL, atualizado_em TIMESTAMPTZ NOT NULL
);
CREATE TABLE desafios (
 id_desafio SERIAL PRIMARY KEY, id_jogo INTEGER NOT NULL REFERENCES jogos(id_jogo) ON UPDATE CASCADE ON DELETE RESTRICT,
 id_missao INTEGER NOT NULL REFERENCES missoes(id_missao) ON UPDATE CASCADE ON DELETE RESTRICT,
 slug VARCHAR(100) NOT NULL, titulo VARCHAR(120) NOT NULL, descricao TEXT, xp_bonus INTEGER NOT NULL DEFAULT 0,
 inicia_em TIMESTAMPTZ NOT NULL, termina_em TIMESTAMPTZ NOT NULL, status "enum_desafios_status" NOT NULL DEFAULT 'rascunho',
 criado_em TIMESTAMPTZ NOT NULL, atualizado_em TIMESTAMPTZ NOT NULL
);
CREATE TABLE participacoes_desafio (
 id_participacao SERIAL PRIMARY KEY, id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
 id_desafio INTEGER NOT NULL REFERENCES desafios(id_desafio) ON UPDATE CASCADE ON DELETE CASCADE,
 status "enum_participacoes_desafio_status" NOT NULL DEFAULT 'iniciada', iniciada_em TIMESTAMPTZ NOT NULL,
 concluida_em TIMESTAMPTZ, xp_obtido INTEGER NOT NULL DEFAULT 0, criado_em TIMESTAMPTZ NOT NULL, atualizado_em TIMESTAMPTZ NOT NULL
);
CREATE TABLE niveis (
 id_nivel SERIAL PRIMARY KEY, numero_nivel INTEGER NOT NULL, titulo VARCHAR(80) NOT NULL, xp_minimo INTEGER NOT NULL,
 criado_em TIMESTAMPTZ NOT NULL, atualizado_em TIMESTAMPTZ NOT NULL
);
CREATE TABLE conquistas (
 id_conquista SERIAL PRIMARY KEY, codigo VARCHAR(100) NOT NULL, titulo VARCHAR(100) NOT NULL, descricao VARCHAR(500) NOT NULL,
 criterio "enum_conquistas_criterio" NOT NULL, meta INTEGER NOT NULL, icone VARCHAR(500),
 status "enum_conquistas_status" NOT NULL DEFAULT 'ativo', criado_em TIMESTAMPTZ NOT NULL, atualizado_em TIMESTAMPTZ NOT NULL
);
CREATE TABLE usuarios_conquistas (
 id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
 id_conquista INTEGER NOT NULL REFERENCES conquistas(id_conquista) ON UPDATE CASCADE ON DELETE CASCADE,
 conquistada_em TIMESTAMPTZ NOT NULL, criado_em TIMESTAMPTZ NOT NULL, atualizado_em TIMESTAMPTZ NOT NULL,
 PRIMARY KEY (id_usuario,id_conquista)
);
CREATE TABLE conteudos (
 id_conteudo SERIAL PRIMARY KEY, id_jogo INTEGER NOT NULL REFERENCES jogos(id_jogo) ON UPDATE CASCADE ON DELETE RESTRICT,
 slug VARCHAR(100) NOT NULL, titulo VARCHAR(120) NOT NULL, resumo VARCHAR(500), tipo "enum_conteudos_tipo" NOT NULL,
 corpo TEXT, url VARCHAR(2000), nivel_minimo INTEGER NOT NULL DEFAULT 1, xp_minimo INTEGER NOT NULL DEFAULT 0,
 status "enum_conteudos_status" NOT NULL DEFAULT 'ativo', criado_em TIMESTAMPTZ NOT NULL, atualizado_em TIMESTAMPTZ NOT NULL
);
CREATE TABLE compartilhamentos (
 id_compartilhamento SERIAL PRIMARY KEY, id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
 id_conquista INTEGER NOT NULL REFERENCES conquistas(id_conquista) ON UPDATE CASCADE ON DELETE CASCADE,
 token VARCHAR(64) NOT NULL, expira_em TIMESTAMPTZ, revogado_em TIMESTAMPTZ,
 criado_em TIMESTAMPTZ NOT NULL, atualizado_em TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX uq_jogos_slug ON jogos(slug);
CREATE INDEX ix_jogos_empresa ON jogos(id_empresa);
CREATE UNIQUE INDEX uq_usuarios_email ON usuarios(email);
CREATE INDEX ix_usuarios_papel_status ON usuarios(papel,status);
CREATE UNIQUE INDEX uq_jornadas_jogo_slug ON jornadas(id_jogo,slug);
CREATE INDEX ix_jornadas_publicacao ON jornadas(id_jogo,status,ordem_jornada);
CREATE UNIQUE INDEX uq_missoes_jornada_slug ON missoes(id_jornada,slug);
CREATE INDEX ix_missoes_publicacao ON missoes(id_jornada,status,ordem_missao);
CREATE UNIQUE INDEX uq_questoes_missao_ordem ON questoes_missao(id_missao,ordem_questao);
CREATE UNIQUE INDEX uq_progresso_usuario_missao ON progresso_usuarios(id_usuario,id_missao);
CREATE INDEX ix_progresso_usuario_status ON progresso_usuarios(id_usuario,status);
CREATE UNIQUE INDEX uq_desafios_jogo_slug ON desafios(id_jogo,slug);
CREATE INDEX ix_desafios_periodo ON desafios(status,inicia_em,termina_em);
CREATE UNIQUE INDEX uq_participacoes_usuario_desafio ON participacoes_desafio(id_usuario,id_desafio);
CREATE UNIQUE INDEX uq_niveis_numero ON niveis(numero_nivel);
CREATE UNIQUE INDEX uq_niveis_xp ON niveis(xp_minimo);
CREATE UNIQUE INDEX uq_conquistas_codigo ON conquistas(codigo);
CREATE INDEX ix_conquistas_criterio ON conquistas(criterio,meta,status);
CREATE INDEX ix_usuarios_conquistas_conquista ON usuarios_conquistas(id_conquista,conquistada_em);
CREATE UNIQUE INDEX uq_conteudos_jogo_slug ON conteudos(id_jogo,slug);
CREATE INDEX ix_conteudos_desbloqueio ON conteudos(id_jogo,status,nivel_minimo);
CREATE UNIQUE INDEX uq_compartilhamentos_token ON compartilhamentos(token);
CREATE INDEX ix_compartilhamentos_usuario_conquista ON compartilhamentos(id_usuario,id_conquista);
COMMIT;
