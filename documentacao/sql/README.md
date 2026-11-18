# Scripts SQL — PostgreSQL

Estes scripts reproduzem a estrutura da migração inicial e os dados demonstrativos da versão atual do backend. Para a instalação normal, prefira as migrações e o seed do projeto, que também gerenciam a inicialização pelo Render.

1. Crie um banco vazio pelo painel do provedor ou, se tiver permissão administrativa, execute `psql -v ON_ERROR_STOP=1 -d postgres -f documentacao/sql/00_criar_banco.sql`. A criação de bancos gerenciados é feita no painel do provedor.
2. Conecte-se **ao banco vazio escolhido**, e execute `psql -v ON_ERROR_STOP=1 -d nexa_play -f documentacao/sql/01_criar_tabelas.sql`. Não execute o script de tabelas no banco existente do projeto: ele pressupõe um banco vazio e falha se houver objetos com o mesmo nome.
3. Execute `psql -v ON_ERROR_STOP=1 -d nexa_play -f documentacao/sql/02_dados_iniciais.sql`. O script insere dados demonstrativos que ainda não existam e não modifica nem exclui registros existentes. Ele não cria usuários.
4. Configure a aplicação para o banco e execute as migrações e o seed conforme o README principal. O Sequelize criará sua tabela de controle de migrações e reconhecerá as tabelas e os índices já existentes; o seed usa busca ou criação dos mesmos dados. Não execute mais de uma inicialização em paralelo enquanto prepara o banco.

Para conexão remota, informe host, porta e usuário ao `psql` ou use variáveis `PGHOST`, `PGPORT`, `PGUSER` e `PGDATABASE`. Não inclua senhas nos comandos, nos scripts ou no repositório; use o mecanismo seguro de autenticação do PostgreSQL.

PostgreSQL não possui o modificador `UNSIGNED` usado originalmente com MySQL; os números são representados por `INTEGER` ou `SMALLINT`, como na migração executada pelo Sequelize nesse banco.
