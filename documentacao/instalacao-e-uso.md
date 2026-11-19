# Instalação e uso

Estas instruções iniciam o site e a API na mesma origem. Os exemplos são para PowerShell no Windows. São necessários Node.js 20 ou superior, npm e um servidor de banco MySQL ou PostgreSQL. Os comandos a seguir são executados a partir da pasta raiz do repositório, salvo indicação em contrário.

## 1. Obter os arquivos

Clone o repositório público ou obtenha uma cópia do projeto. No terminal, entre na pasta do projeto e execute:

```powershell
cd backend
npm ci
Copy-Item .env.example .env
```

Se já existir um `.env`, preserve-o e edite sua cópia atual. Abra `backend/.env` em um editor e preencha uma chave `JWT_SECRET` aleatória com pelo menos 32 caracteres. Por exemplo, este comando mostra uma chave para ser copiada para o arquivo:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Não compartilhe o segredo nem inclua `.env` no Git.

## 2. Configurar e criar o banco

### MySQL local

No `.env`, mantenha `DB_DIALECT=mysql` e ajuste `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD` aos dados do seu MySQL. Inicie o servidor de banco. O usuário precisa ter permissão para criar o banco e suas tabelas.

Na pasta `backend`, execute:

```powershell
npm run db:create
npm run db:migrate
npm run db:seed
```

Se o banco informado em `DB_NAME` já existir, pule `npm run db:create`. As migrações criam as tabelas e o seed insere dados de demonstração.

### PostgreSQL existente

Crie um banco vazio com as ferramentas do PostgreSQL ou do seu provedor. No `.env`, use `DB_DIALECT=postgres` e configure `DATABASE_URL` com a URL de conexão fornecida pelo banco. Ajuste `DB_SSL` conforme a configuração do provedor. A URL contém credenciais e deve permanecer privada. Para preparar o banco existente, execute na pasta `backend`:

```powershell
npm run db:migrate
npm run db:seed
```

Os scripts SQL da pasta [sql/](sql/) também documentam a estrutura e os dados. Use-os somente conforme as instruções dos próprios arquivos, sem aplicar novamente uma criação que já tenha sido feita pelas migrações.

## 3. Executar e acessar

Ainda em `backend`, execute:

```powershell
npm start
```

Abra [http://localhost:3000](http://localhost:3000). A página [http://localhost:3000/api/health](http://localhost:3000/api/health) informa se a aplicação alcança o banco; a documentação interativa está em [http://localhost:3000/api/docs](http://localhost:3000/api/docs). Para encerrar o servidor, pressione `Ctrl+C` no terminal.

Se usar outra porta, ajuste `PORT` no `.env` e os endereços acima. Para abrir o site e usar seus formulários, acesse o servidor; abrir os arquivos diretamente pelo disco não fornece a API.

## 4. Usar o sistema

Na página inicial, navegue pelas informações do projeto e do Nexa Quest. Em **Criar conta**, informe nome, e-mail, senha e confirmação. Depois, use **Entrar** com o mesmo e-mail e senha. O cadastro e o login direcionam para a página da conta, onde é possível conferir a sessão e sair; a experiência completa do jogo e as telas de progresso ainda não estão disponíveis.

Para explorar a API, abra `/api/docs`, consulte as operações e seus parâmetros e autentique-se nas rotas que exigem conta. O catálogo e os exemplos de jornadas, missões e níveis são fornecidos pelo seed. A documentação da API informa quais operações exigem autenticação ou perfil de administrador.

Para criar o primeiro administrador local, defina `ADMIN_NAME`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env`; a senha deve ter entre 12 e 72 caracteres. Depois, execute na pasta `backend`:

```powershell
npm run admin:create
```

Remova as três variáveis do `.env` após a criação. O script não transforma em administrador uma conta de jogador que já exista com o mesmo e-mail.

## 5. Publicação

O arquivo `render.yaml` descreve os serviços de demonstração no Render. A instalação já publicada está em [nexa-play-api-7ida.onrender.com](https://nexa-play-api-7ida.onrender.com). O plano gratuito do banco expira; consulte os [limites e condições do Render](https://render.com/docs/free) antes de depender dos dados.
