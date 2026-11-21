# Scripts SQL para PostgreSQL

Execute os comandos a partir da raiz do repositório com o cliente `psql`. Use uma conta com permissão para criar o banco e os objetos no esquema `public`. Em uma hospedagem gerenciada, use o banco provisionado e comece pelo segundo comando, com o nome e os dados de conexão desse banco.

```sh
psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres -f arquivos-adicionais/sql/00_criar_banco.sql
psql -X -v ON_ERROR_STOP=1 -U postgres -d nexa_play -f arquivos-adicionais/sql/01_criar_tabelas.sql
psql -X -v ON_ERROR_STOP=1 -U postgres -d nexa_play -f arquivos-adicionais/sql/02_dados_iniciais.sql
```

1. Crie o banco `nexa_play` em UTF-8. Execute uma vez, conectado a um banco administrativo como `postgres`. [Script de criação do banco](00_criar_banco.sql).
2. Crie as tabelas, as chaves, os índices e os tipos em uma transação no banco vazio. [Script de criação das tabelas](01_criar_tabelas.sql) · [Migração inicial do Sequelize](../../backend/migrations/20261112000100-create-nexa-schema.js).
3. Carregue o catálogo demonstrativo com o jogo, uma jornada, duas missões, uma pergunta, um desafio, dez níveis, duas conquistas e um conteúdo. Você pode repetir este passo para inserir dados iniciais que estejam faltando. As contas são criadas pela aplicação. [Script de inserção](02_dados_iniciais.sql) · [Seeder do Sequelize](../../backend/seeders/20261112000100-starter-content.js).

Para conectar a um servidor remoto, ajuste `PGHOST`, `PGPORT` e `PGUSER` ou informe `-h`, `-p` e `-U`. Forneça a senha quando o cliente pedir ou por um arquivo de senhas do PostgreSQL.

Após os scripts, configure a conexão da API e execute `npm run db:migrate` na pasta `backend` para registrar a versão da migração no Sequelize. O migrador reconhece as tabelas e os índices já criados. Se você já inseriu os dados iniciais pelo SQL, pode iniciar o servidor com `npm start`. Na implantação padrão, o Render executa as migrações e o seeder automaticamente.

Para MySQL, prepare a base com os comandos do Sequelize. [Guia de instalação e uso](../INSTALACAO-E-USO.md).
