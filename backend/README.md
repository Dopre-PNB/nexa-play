# Backend do Nexa Play

API REST em Node.js, Express, Sequelize e MySQL. A implementação segue o plano do projeto e mantém o site existente em HTML e CSS separado do backend.

## O que está incluído

- Cadastro, login, logout, sessão segura por cookie HttpOnly ou token Bearer e atualização de conta.
- Perfis de jogador e administrador, com rotas administrativas protegidas.
- Cadastro e consulta de empresas, jogos, jornadas, missões, quizzes, desafios, níveis, conquistas e conteúdos.
- Início e conclusão de missões; validação de respostas sem revelar a alternativa correta; XP e níveis calculados pelo progresso.
- Desbloqueio automático de conquistas, jornadas e conteúdos por metas de XP ou nível.
- Links públicos revogáveis para compartilhar conquistas.
- Migração versionada do MySQL, dados iniciais de demonstração e criação segura do primeiro administrador.
- Documentação interativa da API em `/api/docs`.

## Preparar no Windows

1. Abra um terminal dentro desta pasta `backend` e instale as dependências:

   ```powershell
   npm install
   ```

2. Crie o arquivo local de configuração e ajuste os dados do seu MySQL:

   ```powershell
   Copy-Item .env.example .env
   ```

   No `.env`, informe a senha do usuário MySQL, defina `JWT_SECRET` com uma chave aleatória de pelo menos 32 caracteres e confirme a porta do site. O endereço do front-end está na variável `FRONTEND_ORIGINS`.

3. Crie o banco `nexa_play` se ele ainda não existir e aplique o esquema e os dados iniciais:

   ```powershell
   npm run db:create
   npm run db:migrate
   npm run db:seed
   ```

   Se o banco já existir, pule `npm run db:create`.

4. Crie o primeiro administrador. Antes de executar, preencha `ADMIN_NAME`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env`; a senha precisa ter pelo menos 12 caracteres. Depois, remova esses três valores do `.env`.

   ```powershell
   npm run admin:create
   ```

5. Inicie a API:

   ```powershell
   npm run dev
   ```

O servidor usa a porta `3000` por padrão. Confira a disponibilidade em `http://localhost:3000/api/health` e abra a documentação em `http://localhost:3000/api/docs`.

## Render

O arquivo `../render.yaml` prepara o serviço web e um PostgreSQL gratuito em Virginia. Ele hospeda as páginas estáticas na raiz do mesmo endereço e executa as migrações ao iniciar. A configuração usa um segredo gerado pelo Render para a sessão.

O plano gratuito é para demonstração: o serviço web pode dormir após 15 minutos sem tráfego e demorar cerca de um minuto para voltar. O PostgreSQL gratuito expira 30 dias após a criação; os dados ficam indisponíveis quando expira e podem ser apagados depois do período de recuperação. Faça uma cópia dos dados se precisar mantê-los.

Os formulários de cadastro e login agora enviam os dados ao backend quando as páginas são servidas pelo serviço. Ao abrir os arquivos diretamente do disco, essa ligação não funciona. As migrações e os dados de demonstração são aplicados ao iniciar o serviço no Render.

## Rotas principais

Todas as rotas abaixo usam o prefixo `/api`.

| Recurso | Rotas |
|---|---|
| Conta | `POST /usuarios`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `PATCH /usuarios/me` |
| Catálogo público | `GET /empresas`, `/jogos`, `/jornadas`, `/missoes`, `/desafios`, `/niveis`, `/conquistas` |
| Progresso | `POST /missoes/:id/iniciar`, `GET /missoes/:id/questoes`, `POST /missoes/:id/concluir` |
| Desafios | `POST /desafios/:id/iniciar`, `POST /desafios/:id/concluir` |
| Perfil de jogo | `GET /usuarios/me/progresso`, `GET /usuarios/me/conquistas`, `GET /conteudos` |
| Compartilhar | `POST /conquistas/:id/compartilhar`, `GET /compartilhamentos/:token`, `DELETE /compartilhamentos/:id` |
| Administração | CRUD de catálogo em `/admin/{recurso}` e gerenciamento de usuários em `/admin/usuarios` |

Rotas administrativas exigem uma sessão de administrador. O catálogo público não mostra rascunhos; a API de conteúdos só entrega corpo e URL quando o jogador alcança os requisitos.

## Dados de demonstração

O seed cria o jogo “Nexa Quest”, uma jornada com missão de confirmação e quiz, um desafio, dois conteúdos de demonstração, dez níveis e duas conquistas. Esses registros servem para demonstrar a API; podem ser alterados ou removidos pelo administrador.

## Integração com as páginas HTML e CSS

O front-end existente foi mantido sem alterações. O backend disponibiliza a API, mas páginas estáticas em HTML e CSS não enviam formulários ou atualizam o progresso sozinhas; essa ligação exigiria JavaScript no navegador ou a conversão das páginas em views servidas pelo backend. A autenticação por cookie já está preparada para um front-end servido em uma origem permitida em `FRONTEND_ORIGINS`.
