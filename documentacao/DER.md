# Diagrama Entidade-Relacionamento (DER)

Diagrama das tabelas de negócio da migração inicial. A notação `||` indica exatamente um; `o{` indica zero ou muitos. PK representa chave primária e FK chave estrangeira. Os atributos completos, tipos, índices e restrições estão em [modelagem-logica.md](modelagem-logica.md).

```mermaid
erDiagram
    EMPRESAS ||--o{ JOGOS : possui
    JOGOS ||--o{ JORNADAS : organiza
    JORNADAS ||--o{ MISSOES : contem
    MISSOES ||--o{ QUESTOES_MISSAO : possui
    USUARIOS ||--o{ PROGRESSO_USUARIOS : registra
    MISSOES ||--o{ PROGRESSO_USUARIOS : recebe
    JOGOS ||--o{ DESAFIOS : possui
    MISSOES ||--o{ DESAFIOS : compoe
    USUARIOS ||--o{ PARTICIPACOES_DESAFIO : realiza
    DESAFIOS ||--o{ PARTICIPACOES_DESAFIO : recebe
    USUARIOS ||--o{ USUARIOS_CONQUISTAS : conquista
    CONQUISTAS ||--o{ USUARIOS_CONQUISTAS : obtida
    JOGOS ||--o{ CONTEUDOS : possui
    USUARIOS ||--o{ COMPARTILHAMENTOS : cria
    CONQUISTAS ||--o{ COMPARTILHAMENTOS : divulgada

    EMPRESAS {
        int id_empresa PK
        string nome
    }
    JOGOS {
        int id_jogo PK
        int id_empresa FK
        string slug
        string nome
        string status
    }
    USUARIOS {
        int id_usuario PK
        string nome_jogador
        string email
        string senha_hash
        string papel
        string status
    }
    JORNADAS {
        int id_jornada PK
        int id_jogo FK
        string slug
        string titulo
        int nivel_minimo
        string status
    }
    MISSOES {
        int id_missao PK
        int id_jornada FK
        string slug
        string titulo
        string tipo
        int xp_recompensa
        string status
    }
    QUESTOES_MISSAO {
        int id_questao PK
        int id_missao FK
        string enunciado
        json opcoes
        int indice_resposta
        int ordem_questao
    }
    PROGRESSO_USUARIOS {
        int id_progresso PK
        int id_usuario FK
        int id_missao FK
        string status
        int xp_obtido
    }
    DESAFIOS {
        int id_desafio PK
        int id_jogo FK
        int id_missao FK
        string titulo
        int xp_bonus
        string status
    }
    PARTICIPACOES_DESAFIO {
        int id_participacao PK
        int id_usuario FK
        int id_desafio FK
        string status
        int xp_obtido
    }
    NIVEIS {
        int id_nivel PK
        int numero_nivel
        string titulo
        int xp_minimo
    }
    CONQUISTAS {
        int id_conquista PK
        string codigo
        string titulo
        string criterio
        int meta
    }
    USUARIOS_CONQUISTAS {
        int id_usuario PK,FK
        int id_conquista PK,FK
        datetime conquistada_em
    }
    CONTEUDOS {
        int id_conteudo PK
        int id_jogo FK
        string titulo
        string tipo
        int nivel_minimo
        int xp_minimo
    }
    COMPARTILHAMENTOS {
        int id_compartilhamento PK
        int id_usuario FK
        int id_conquista FK
        string token
        datetime expira_em
        datetime revogado_em
    }
```

`NIVEIS` é independente no esquema físico: os níveis são calculados usando os limites de XP, sem chave estrangeira para usuários.
