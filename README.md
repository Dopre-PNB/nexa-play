# Nexa Play

O Nexa Play é um projeto de jogos e experiências digitais. Seu primeiro projeto, o **Nexa Quest**, é apresentado no site por meio de páginas institucionais, cadastro e acesso de usuários. Esta entrega reúne o front-end, uma API REST e a estrutura de banco de dados necessária para uma demonstração do sistema.

- **Site publicado:** [nexa-play-api-7ida.onrender.com](https://nexa-play-api-7ida.onrender.com)
- **Repositório:** [github.com/Dopre-PNB/nexa-play](https://github.com/Dopre-PNB/nexa-play).
- **Documentação da API:** [nexa-play-api-7ida.onrender.com/api/docs](https://nexa-play-api-7ida.onrender.com/api/docs)
- **Estado da API e do banco:** [nexa-play-api-7ida.onrender.com/api/health](https://nexa-play-api-7ida.onrender.com/api/health)

## Objetivo

Apresentar a Nexa Play e oferecer uma base para experiências educativas com jornadas, missões, desafios, níveis e conquistas, mantendo usuários e progresso em um banco de dados.

## Funcionalidades

No site é possível navegar pelas páginas de apresentação, criar uma conta ou entrar com e-mail e senha e acessar a página da conta com opção de sair. Os formulários se comunicam com a API quando o site é acessado pelo servidor. A API, documentada em `/api/docs`, oferece:

- Autenticação, sessão por cookie ou token e consulta ou atualização do próprio perfil.
- Consulta ao catálogo de jogos, jornadas, missões, desafios, níveis e conquistas.
- Início e conclusão de missões e desafios, cálculo de XP e níveis e desbloqueio de conquistas e conteúdos.
- Compartilhamento de conquistas e rotas administrativas protegidas para gerenciamento do catálogo e de usuários.
- Dados iniciais de demonstração para experimentar os recursos da API.

As telas públicas apresentam o projeto e integram cadastro e login. O jogo completo e uma interface para jogar as missões ainda não estão disponíveis; as funções de progresso estão disponíveis pela API. O acesso por Google ou Apple, recuperação de senha e downloads nas lojas ainda não estão implementados. Os dados iniciais são exemplos, não conteúdo definitivo do jogo.

## Tecnologias

- **Front-end:** HTML5 e CSS3.
- **Servidor:** Node.js, Express e API REST.
- **Persistência:** Sequelize, com suporte a MySQL para desenvolvimento e PostgreSQL no Render.
- **Segurança e validação:** bcryptjs, JSON Web Token, cookies HttpOnly, Helmet, limite de tentativas e Zod.
- **Documentação e hospedagem:** OpenAPI/Swagger UI, GitHub e Render.

## Estrutura do projeto

```text
├── index.html, login.html, cadastro.html, ...  # páginas do site
├── styles.css, auth.css, about.css             # estilos
├── assets/                                    # imagens e fontes
├── backend/
│   ├── src/                                   # aplicação e API
│   ├── migrations/                            # criação versionada das tabelas
│   ├── seeders/                               # dados iniciais de demonstração
│   ├── config/                                # configuração do Sequelize
│   ├── scripts/                               # criação de administrador
│   ├── .env.example                           # exemplo de configuração local
│   └── openapi.yaml                           # especificação da API
├── documentacao/                              # modelagem e instruções
│   └── sql/                                   # scripts SQL
└── render.yaml                                # configuração da hospedagem
```

## Instalação e uso

É necessário ter Node.js 20 ou superior, npm e um banco MySQL ou PostgreSQL acessível. Para instruções completas de configuração, banco, execução, uso e criação de administrador, consulte [Instalação e uso](documentacao/instalacao-e-uso.md). Uma inicialização local com MySQL pode ser feita no PowerShell:

```powershell
cd backend
npm ci
Copy-Item .env.example .env
```

Edite `backend/.env`, informe os dados do banco e uma chave `JWT_SECRET` aleatória de pelo menos 32 caracteres. Com o MySQL em execução e o usuário com permissão para criar o banco:

```powershell
npm run db:create
npm run db:migrate
npm run db:seed
npm start
```

Se o banco já existir, ignore `db:create`. Acesse [http://localhost:3000](http://localhost:3000) e [http://localhost:3000/api/docs](http://localhost:3000/api/docs). Os comandos devem ser executados na pasta `backend`. Não envie o arquivo `.env` ao repositório.

## Modelagem e banco de dados

Os documentos e scripts estão organizados na pasta `documentacao`:

- [Modelagem conceitual](documentacao/modelagem-conceitual.md).
- [Modelagem lógica](documentacao/modelagem-logica.md).
- [Diagrama entidade-relacionamento (DER)](documentacao/DER.md).
- [Scripts SQL de criação e inserção](documentacao/sql/).

A aplicação também contém migrações e dados iniciais versionados em `backend/migrations/` e `backend/seeders/`; escolha um método de criação ao preparar o banco para evitar estruturas duplicadas.

As entidades abrangem empresas e jogos; jogadores e seus perfis; jornadas, missões e questões; progresso e desafios; níveis, conquistas e seus compartilhamentos; e conteúdos desbloqueáveis. A modelagem registra os relacionamentos e as chaves entre elas.

## Hospedagem de demonstração

O `render.yaml` configura um serviço web e um PostgreSQL no plano gratuito. O serviço pode dormir depois de um período sem acessos e demorar para responder ao retornar. O PostgreSQL gratuito expira após 30 dias, portanto os dados da demonstração não devem ser tratados como permanentes. Consulte os [limites do plano gratuito do Render](https://render.com/docs/free).
