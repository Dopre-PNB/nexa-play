# Diagrama Entidade-Relacionamento (DER)

O diagrama representa as 14 tabelas de negócio. Cada ligação indica que um registro da tabela à esquerda pode ter zero ou muitos registros à direita e que cada registro à direita aponta para exatamente um à esquerda. A linha contínua indica que a referência integra a chave primária da tabela dependente.

```mermaid
erDiagram
    empresas ||..o{ jogos : publica
    jogos ||..o{ jornadas : organiza
    jornadas ||..o{ missoes : contem
    missoes ||..o{ questoes_missao : apresenta
    usuarios ||..o{ progresso_usuarios : registra
    missoes ||..o{ progresso_usuarios : recebe
    jogos ||..o{ desafios : oferece
    missoes ||..o{ desafios : integra
    usuarios ||..o{ participacoes_desafio : realiza
    desafios ||..o{ participacoes_desafio : recebe
    usuarios ||--o{ usuarios_conquistas : obtem
    conquistas ||--o{ usuarios_conquistas : concedida
    jogos ||..o{ conteudos : oferece
    usuarios ||..o{ compartilhamentos : cria
    conquistas ||..o{ compartilhamentos : divulgada

    empresas {
        int id_empresa PK
        varchar nome
        text descricao
        smallint ano_fundacao
        varchar slogan
    }
    jogos {
        int id_jogo PK
        int id_empresa FK
        varchar slug UK
        varchar nome
        text descricao
        varchar genero
        varchar plataforma
        enum status
    }
    usuarios {
        int id_usuario PK
        varchar nome_jogador
        varchar email UK
        varchar senha_hash
        enum papel
        enum status
        int token_version
        datetime excluido_em
    }
    jornadas {
        int id_jornada PK
        int id_jogo FK
        varchar slug
        varchar titulo
        text descricao
        int ordem_jornada
        int nivel_minimo
        enum status
    }
    missoes {
        int id_missao PK
        int id_jornada FK
        varchar slug
        varchar titulo
        text descricao
        int ordem_missao
        enum tipo
        decimal nota_minima
        int xp_recompensa
        int nivel_minimo
        enum status
    }
    questoes_missao {
        int id_questao PK
        int id_missao FK
        varchar enunciado
        json opcoes
        smallint indice_resposta
        int ordem_questao
    }
    progresso_usuarios {
        int id_progresso PK
        int id_usuario FK
        int id_missao FK
        enum status
        datetime iniciada_em
        datetime concluida_em
        int xp_obtido
    }
    desafios {
        int id_desafio PK
        int id_jogo FK
        int id_missao FK
        varchar slug
        varchar titulo
        text descricao
        int xp_bonus
        datetime inicia_em
        datetime termina_em
        enum status
    }
    participacoes_desafio {
        int id_participacao PK
        int id_usuario FK
        int id_desafio FK
        enum status
        datetime iniciada_em
        datetime concluida_em
        int xp_obtido
    }
    niveis {
        int id_nivel PK
        int numero_nivel UK
        varchar titulo
        int xp_minimo UK
    }
    conquistas {
        int id_conquista PK
        varchar codigo UK
        varchar titulo
        varchar descricao
        enum criterio
        int meta
        varchar icone
        enum status
    }
    usuarios_conquistas {
        int id_usuario PK, FK
        int id_conquista PK, FK
        datetime conquistada_em
    }
    conteudos {
        int id_conteudo PK
        int id_jogo FK
        varchar slug
        varchar titulo
        varchar resumo
        enum tipo
        text corpo
        varchar url
        int nivel_minimo
        int xp_minimo
        enum status
    }
    compartilhamentos {
        int id_compartilhamento PK
        int id_usuario FK
        int id_conquista FK
        varchar token UK
        datetime expira_em
        datetime revogado_em
    }
```

**PK** indica chave primária, **FK** indica chave estrangeira e **UK** indica unicidade em uma única coluna. Em `usuarios_conquistas`, as duas colunas marcadas como PK formam uma chave composta. Todas as tabelas também registram `criado_em` e `atualizado_em`.

A aplicação consulta `niveis` por XP, por isso a tabela aparece isolada. Os compartilhamentos usam chaves separadas para o usuário e a conquista. A validação da posse da conquista fica na API.

[Modelo conceitual](modelagem-conceitual.md) · [Modelo lógico com campos opcionais, chaves e índices compostos](modelagem-logica.md)
