# Modelagem lógica — Nexa Play

O modelo descreve as 14 tabelas de negócio da [migração inicial do Sequelize](../backend/migrations/20261112000100-create-nexa-schema.js).

**PK** indica chave primária, **FK** indica chave estrangeira e **UQ** indica unicidade. Todos os campos são obrigatórios salvo indicação `?`. `texto(n)` representa texto de até n caracteres. `data` representa data e hora. As chaves primárias simples são inteiros autoincrementais. Todas as tabelas incluem `criado_em` e `atualizado_em` obrigatórios.

| Tabela | Campos além de `criado_em` e `atualizado_em` | Restrições |
|---|---|---|
| `empresas` | `id_empresa` inteiro PK; `nome` texto(120); `descricao` texto?; `ano_fundacao` inteiro pequeno?; `slogan` texto(240)? | — |
| `jogos` | `id_jogo` inteiro PK; `id_empresa` inteiro FK; `slug` texto(100); `nome` texto(120); `descricao` texto?; `genero` texto(80)?; `plataforma` texto(120)?; `status` enum | FK → `empresas.id_empresa`; UQ `slug`; status: ativo/inativo. |
| `usuarios` | `id_usuario` inteiro PK; `nome_jogador` texto(40); `email` texto(254); `senha_hash` texto(100); `papel` enum; `status` enum; `token_version` inteiro; `excluido_em` data? | UQ `email`; papel: jogador/admin; status: ativo/suspenso. Senhas são armazenadas como hash. |
| `jornadas` | `id_jornada` inteiro PK; `id_jogo` inteiro FK; `slug` texto(100); `titulo` texto(120); `descricao` texto?; `ordem_jornada` inteiro; `nivel_minimo` inteiro; `status` enum | FK → `jogos.id_jogo`; UQ (`id_jogo`, `slug`); status: rascunho/publicada/arquivada. |
| `missoes` | `id_missao` inteiro PK; `id_jornada` inteiro FK; `slug` texto(100); `titulo` texto(120); `descricao` texto?; `ordem_missao` inteiro; `tipo` enum; `nota_minima` decimal(5,2); `xp_recompensa` inteiro; `nivel_minimo` inteiro; `status` enum | FK → `jornadas.id_jornada`; UQ (`id_jornada`, `slug`); tipo: quiz/confirmacao; status: rascunho/publicada/arquivada. |
| `questoes_missao` | `id_questao` inteiro PK; `id_missao` inteiro FK; `enunciado` texto(1000); `opcoes` JSON; `indice_resposta` inteiro pequeno; `ordem_questao` inteiro | FK → `missoes.id_missao`; UQ (`id_missao`, `ordem_questao`). |
| `progresso_usuarios` | `id_progresso` inteiro PK; `id_usuario` inteiro FK; `id_missao` inteiro FK; `status` enum; `iniciada_em` data; `concluida_em` data?; `xp_obtido` inteiro | FK → `usuarios.id_usuario`, `missoes.id_missao`; UQ (`id_usuario`, `id_missao`); status: iniciada/concluida. |
| `desafios` | `id_desafio` inteiro PK; `id_jogo` inteiro FK; `id_missao` inteiro FK; `slug` texto(100); `titulo` texto(120); `descricao` texto?; `xp_bonus` inteiro; `inicia_em` data; `termina_em` data; `status` enum | FK → `jogos.id_jogo`, `missoes.id_missao`; UQ (`id_jogo`, `slug`); status: rascunho/ativo/encerrado. |
| `participacoes_desafio` | `id_participacao` inteiro PK; `id_usuario` inteiro FK; `id_desafio` inteiro FK; `status` enum; `iniciada_em` data; `concluida_em` data?; `xp_obtido` inteiro | FK → `usuarios.id_usuario`, `desafios.id_desafio`; UQ (`id_usuario`, `id_desafio`); status: iniciada/concluida. |
| `niveis` | `id_nivel` inteiro PK; `numero_nivel` inteiro; `titulo` texto(80); `xp_minimo` inteiro | UQ `numero_nivel`; UQ `xp_minimo`. |
| `conquistas` | `id_conquista` inteiro PK; `codigo` texto(100); `titulo` texto(100); `descricao` texto(500); `criterio` enum; `meta` inteiro; `icone` texto(500)?; `status` enum | UQ `codigo`; critério: missoes_concluidas/jornadas_concluidas/desafios_concluidos/xp_total; status: ativo/inativo. |
| `usuarios_conquistas` | `id_usuario` inteiro PK/FK; `id_conquista` inteiro PK/FK; `conquistada_em` data | PK composta (`id_usuario`, `id_conquista`); FK → `usuarios.id_usuario`, `conquistas.id_conquista`. |
| `conteudos` | `id_conteudo` inteiro PK; `id_jogo` inteiro FK; `slug` texto(100); `titulo` texto(120); `resumo` texto(500)?; `tipo` enum; `corpo` texto?; `url` texto(2000)?; `nivel_minimo` inteiro; `xp_minimo` inteiro; `status` enum | FK → `jogos.id_jogo`; UQ (`id_jogo`, `slug`); tipo: artigo/video/bonus; status: ativo/inativo. |
| `compartilhamentos` | `id_compartilhamento` inteiro PK; `id_usuario` inteiro FK; `id_conquista` inteiro FK; `token` texto(64); `expira_em` data?; `revogado_em` data? | FK → `usuarios.id_usuario`, `conquistas.id_conquista`; UQ `token`. |

## Valores iniciais no banco

- Jogos, usuários, conquistas e conteúdos começam com situação `ativo`. Usuários recebem o papel `jogador` e `token_version` igual a `0`.
- Jornadas, missões e desafios começam em `rascunho`. Ordem e nível mínimo de jornadas e missões começam em `1`. Na missão, o tipo inicial é `confirmacao` e a nota mínima é `100`.
- Progresso de missão e participação em desafio começam em `iniciada`. O XP obtido, a recompensa de missão e o bônus de desafio têm padrão `0`. Conteúdos têm nível mínimo `1` e XP mínimo `0`.

## Integridade e índices

Todas as chaves estrangeiras atualizam em cascata. A exclusão física propaga de missões para questões, de usuários para progresso de missões, de usuários e desafios para participações e de usuários e conquistas para concessões de conquista e compartilhamentos. As demais referências restringem a exclusão. Quando a API exclui uma conta, preenche `excluido_em` e preserva o registro. A autenticação usa o campo `token_version` para invalidar tokens de sessão.

As restrições de unicidade da tabela acima são implementadas por chaves primárias e índices únicos. A migração inclui estes índices adicionais, além dos índices implícitos do banco:

| Tabela | Campos do índice, na ordem |
| --- | --- |
| `jogos` | `id_empresa` |
| `usuarios` | `papel`, `status` |
| `jornadas` | `id_jogo`, `status`, `ordem_jornada` |
| `missoes` | `id_jornada`, `status`, `ordem_missao` |
| `progresso_usuarios` | `id_usuario`, `status` |
| `desafios` | `status`, `inicia_em`, `termina_em` |
| `conquistas` | `criterio`, `meta`, `status` |
| `usuarios_conquistas` | `id_conquista`, `conquistada_em` |
| `conteudos` | `id_jogo`, `status`, `nivel_minimo` |
| `compartilhamentos` | `id_usuario`, `id_conquista` |

O PostgreSQL do Render usa `integer` e `smallint` com sinal, enquanto o MySQL aceita os modificadores `UNSIGNED` do Sequelize. O Sequelize CLI usa `SequelizeMeta` para registrar as migrações aplicadas.

[Modelo conceitual](modelagem-conceitual.md) · [DER](DER.md)
