-- PostgreSQL. Dados demonstrativos de backend/seeders/20261112000100-starter-content.js.
-- Execute no banco de demonstração após criar as tabelas. As contas são criadas pela aplicação.
BEGIN;
SET LOCAL search_path TO public;
SET LOCAL client_encoding TO 'UTF8';
SET LOCAL TIME ZONE 'UTC';

DO $$
DECLARE
 v_empresa INTEGER;
 v_jogo INTEGER;
 v_jornada INTEGER;
 v_missao_boas_vindas INTEGER;
 v_quiz INTEGER;
BEGIN
 SELECT id_empresa INTO v_empresa FROM empresas WHERE nome = 'Nexa Play' ORDER BY id_empresa LIMIT 1;
 IF v_empresa IS NULL THEN
   INSERT INTO empresas (nome,descricao,slogan,criado_em,atualizado_em)
   VALUES ('Nexa Play','Plataforma de aprendizagem em jogos digitais.','Aprenda jogando.',NOW(),NOW())
   RETURNING id_empresa INTO v_empresa;
 END IF;
 INSERT INTO jogos (id_empresa,slug,nome,descricao,genero,plataforma,status,criado_em,atualizado_em)
 VALUES (v_empresa,'nexa-quest','Nexa Quest','Jornada de demonstração para validar o progresso de jogadores.','Aventura educativa','Web','ativo',NOW(),NOW())
 ON CONFLICT (slug) DO NOTHING;
 SELECT id_jogo INTO STRICT v_jogo FROM jogos WHERE slug='nexa-quest';
 INSERT INTO jornadas (id_jogo,slug,titulo,descricao,ordem_jornada,nivel_minimo,status,criado_em,atualizado_em)
 VALUES (v_jogo,'primeiros-passos','Primeiros passos','Uma jornada de demonstração para experimentar o Nexa Play.',1,1,'publicada',NOW(),NOW())
 ON CONFLICT (id_jogo,slug) DO NOTHING;
 SELECT id_jornada INTO STRICT v_jornada FROM jornadas WHERE id_jogo=v_jogo AND slug='primeiros-passos';
 INSERT INTO missoes (id_jornada,slug,titulo,descricao,ordem_missao,tipo,nota_minima,xp_recompensa,nivel_minimo,status,criado_em,atualizado_em)
 VALUES
 (v_jornada,'boas-vindas','Boas-vindas','Confirme que está pronto para começar sua jornada.',1,'confirmacao',100,50,1,'publicada',NOW(),NOW()),
 (v_jornada,'conhecendo-a-plataforma','Conhecendo a plataforma','Questão de demonstração para verificar a conclusão de quizzes.',2,'quiz',100,100,1,'publicada',NOW(),NOW())
 ON CONFLICT (id_jornada,slug) DO NOTHING;
 SELECT id_missao INTO STRICT v_missao_boas_vindas FROM missoes WHERE id_jornada=v_jornada AND slug='boas-vindas';
 SELECT id_missao INTO STRICT v_quiz FROM missoes WHERE id_jornada=v_jornada AND slug='conhecendo-a-plataforma';
 INSERT INTO questoes_missao (id_missao,enunciado,opcoes,indice_resposta,ordem_questao,criado_em,atualizado_em)
 VALUES (v_quiz,'Qual é a ação usada para registrar sua entrada em uma missão?',
 '["Iniciar missão","Compartilhar conquista","Alterar perfil"]'::json,0,1,NOW(),NOW())
 ON CONFLICT (id_missao,ordem_questao) DO NOTHING;
 INSERT INTO niveis (numero_nivel,titulo,xp_minimo,criado_em,atualizado_em) VALUES
 (1,'Iniciante',0,NOW(),NOW()),(2,'Explorador',100,NOW(),NOW()),(3,'Aventureiro',250,NOW(),NOW()),
 (4,'Estrategista',450,NOW(),NOW()),(5,'Especialista',700,NOW(),NOW()),(6,'Veterano',1000,NOW(),NOW()),
 (7,'Mestre',1400,NOW(),NOW()),(8,'Lenda',1900,NOW(),NOW()),(9,'Ícone',2500,NOW(),NOW()),(10,'Nexa',3200,NOW(),NOW())
 ON CONFLICT DO NOTHING;
 INSERT INTO conquistas (codigo,titulo,descricao,criterio,meta,status,criado_em,atualizado_em) VALUES
 ('primeira-missao','Primeira missão','Conclua sua primeira missão.','missoes_concluidas',1,'ativo',NOW(),NOW()),
 ('cem-de-xp','Primeiros 100 XP','Acumule 100 pontos de experiência.','xp_total',100,'ativo',NOW(),NOW())
 ON CONFLICT (codigo) DO NOTHING;
 INSERT INTO conteudos (id_jogo,slug,titulo,resumo,tipo,corpo,nivel_minimo,xp_minimo,status,criado_em,atualizado_em)
 VALUES (v_jogo,'conteudo-de-demonstracao','Conteúdo liberado por nível',
 'Exemplo de material que o backend libera conforme o progresso.','artigo',
 'Este texto aparece para jogadores que alcançaram o nível 2 e pelo menos 100 XP.',2,100,'ativo',NOW(),NOW())
 ON CONFLICT (id_jogo,slug) DO NOTHING;
 INSERT INTO desafios (id_jogo,id_missao,slug,titulo,descricao,xp_bonus,inicia_em,termina_em,status,criado_em,atualizado_em)
 VALUES (v_jogo,v_missao_boas_vindas,'semana-de-boas-vindas','Desafio de boas-vindas',
 'Conclua a missão de boas-vindas durante o período do desafio.',25,NOW()-INTERVAL '1 day',NOW()+INTERVAL '365 days','ativo',NOW(),NOW())
 ON CONFLICT (id_jogo,slug) DO NOTHING;
END $$;
COMMIT;
