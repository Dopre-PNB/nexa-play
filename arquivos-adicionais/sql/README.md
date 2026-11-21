# Scripts SQL para PostgreSQL

Execute os comandos a partir da raiz do repositório com o cliente `psql`. Use uma conta com permissão para criar o banco e os objetos no esquema `public`. Em uma hospedagem gerenciada, use o banco provisionado e comece pelo segundo comando, com o nome e os dados de conexão desse banco.

```sh
psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres -f arquivos-adicionais/sql/00_criar_banco.sql
psql -X -v ON_ERROR_STOP=1 -U postgres -d nexa_play -f arquivos-adicionais/sql/01_criar_tabelas.sql
psql -X -v ON_ERROR_STOP=1 -U postgres -d nexa_play -f arquivos-adicionais/sql/02_dados_iniciais.sql
```

1. [Criar o banco](00_criar_banco.sql) cria `nexa_play` em UTF-8. O comando deve ser executado uma vez, conectado a um banco administrativo como `postgres`.
2. [Criar as tabelas](01_criar_tabelas.sql) exige um banco vazio. A transação cria as tabelas, chaves, índices e tipos da [migração inicial do Sequelize](../../backend/migrations/20261112000100-create-nexa-schema.js).
3. [Inserir os dados iniciais](02_dados_iniciais.sql) popula o catálogo demonstrativo do [seeder](../../backend/seeders/20261112000100-starter-content.js). Inclui o jogo, uma jornada, duas missões, uma pergunta, um desafio, dez níveis, duas conquistas e um conteúdo. Em execuções sucessivas, preserva os registros existentes e acrescenta os dados demonstrativos que estiverem faltando. Crie contas pela interface do sistema e o administrador pelo comando indicado no guia de instalação.

Para conectar a um servidor remoto, ajuste `PGHOST`, `PGPORT` e `PGUSER` ou informe `-h`, `-p` e `-U`. Forneça a senha quando o cliente pedir ou por um arquivo de senhas do PostgreSQL.

Após os scripts, configure a conexão da API e execute `npm run db:migrate` na pasta `backend` para registrar a versão da migração no Sequelize. O migrador reconhece as tabelas e os índices já criados. Se você já inseriu os dados iniciais pelo SQL, pode iniciar o servidor com `npm start`. Na implantação padrão, o Render executa as migrações e o seeder automaticamente.

Para MySQL, siga o [guia de instalação e uso](../INSTALACAO-E-USO.md) e prepare a base com os comandos do Sequelize.
