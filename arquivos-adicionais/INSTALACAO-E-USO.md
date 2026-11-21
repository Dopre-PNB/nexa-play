# Instalação e uso

A Nexa Play serve as páginas do site e a API no mesmo endereço. Para acessar a demonstração publicada, use o link no [README principal](../README.md). As instruções abaixo reproduzem o sistema localmente. Os exemplos usam PowerShell.

## 1. Baixar e instalar

Instale Node.js 20 ou superior e npm. Você também precisa de um servidor MySQL ou PostgreSQL. Os scripts SQL desta entrega usam PostgreSQL e o cliente `psql`.

Clone o repositório com Git ou baixe o ZIP pelo GitHub e extraia os arquivos. Para clonar e instalar as dependências:

```powershell
git clone https://github.com/Dopre-PNB/nexa-play.git
Set-Location nexa-play/backend
npm ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

A partir daqui, execute os comandos npm na pasta `backend`. No arquivo `backend/.env`, preencha `JWT_SECRET` com uma chave aleatória exclusiva de pelo menos 32 caracteres. Gere o valor em um terminal privado e copie-o para o arquivo:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Mantenha o arquivo `.env` fora do Git. Para executar localmente por HTTP, preserve `NODE_ENV=development` e `COOKIE_SECURE=false` do exemplo.

## 2. Configurar o banco e carregar os dados

Escolha MySQL ou PostgreSQL. Os dados iniciais incluem o Nexa Quest, a jornada **Primeiros passos**, missões, um desafio, níveis, conquistas e conteúdo desbloqueável. Crie contas pela interface.

### MySQL local

Inicie o MySQL. No `.env`, mantenha `DB_DIALECT=mysql` e preencha `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD`. A porta padrão do MySQL é `3306`. A conta do banco deve ter permissão para criar as tabelas.

Se o banco ainda não existir e a conta tiver permissão para criá-lo, execute `npm run db:create`. Com o banco criado, execute:

```powershell
npm run db:migrate
npm run db:seed
```

### PostgreSQL

Crie um banco vazio ou use um banco de desenvolvimento já provisionado. No `.env`, configure `DB_DIALECT=postgres`, informe `DATABASE_URL` com a URL de conexão fornecida pelo PostgreSQL e ajuste `DB_SSL` conforme o provedor. A URL inclui credenciais e deve permanecer privada.

Para a instalação com Sequelize, execute as migrações e a carga inicial:

```powershell
npm run db:migrate
npm run db:seed
```

Para preparar um banco PostgreSQL com os SQL da entrega, siga o [guia dos scripts](sql/README.md). Ele descreve a criação do banco, das tabelas e a inserção de dados demonstrativos. Após aplicar os scripts em um banco vazio e registrar a migração do Sequelize, prossiga para a etapa 3.

## 3. Iniciar e verificar

```powershell
npm start
```

- **Site local** em [localhost:3000](http://localhost:3000/).
- **Verificação da conexão ao banco** em [localhost:3000/api/health](http://localhost:3000/api/health). A resposta esperada inclui `"status":"ok"` e `"banco":"conectado"`.
- **Documentação interativa** em [localhost:3000/api/docs](http://localhost:3000/api/docs).

Abra as páginas pelo endereço do servidor para que os formulários alcancem a API. Pressione **Ctrl+C** para encerrar. Se mudar `PORT` no `.env`, use essa porta nos endereços locais. Ajuste também `API_PUBLIC_URL` para a URL da API, incluindo `/api`, se usar uma porta local diferente e quiser gerar links de compartilhamento.

## 4. Usar o site e testar o progresso

1. Abra a página inicial e navegue pelas páginas da Nexa Play e do Nexa Quest.
2. Escolha **Criar conta**, informe o nome de jogador, o e-mail e uma senha com pelo menos oito caracteres. Digite a senha novamente no campo de confirmação. Após o cadastro, a página da conta abre automaticamente. Confira o nome e o e-mail.
3. Selecione **Sair da conta** e volte a entrar com as mesmas credenciais para verificar o login.
4. Abra `/api/docs` na mesma origem e no mesmo navegador em que a sessão está ativa. As operações autenticadas usam o cookie da sessão. Para executar uma operação no Swagger, abra-a e selecione **Try it out** e **Execute**.
5. Use `GET /jornadas` para encontrar o identificador de **Primeiros passos** e `GET /jornadas/{id}/missoes` para localizar a missão **Boas-vindas**. Com o identificador da missão, execute `POST /missoes/{id}/iniciar` e depois `POST /missoes/{id}/concluir` com o corpo `{"tipo":"confirmacao","confirmada":true}`.
6. Consulte `GET /usuarios/me/progresso` e `GET /usuarios/me/conquistas` para conferir o resultado. As missões e o progresso são demonstrados pela API.

Para seguir com o quiz **Conhecendo a plataforma**, inicie a missão e use `GET /missoes/{id}/questoes`. No corpo da conclusão, envie `tipo` igual a `quiz` e uma lista `respostas` com o identificador de cada questão e o índice da opção escolhida. O primeiro índice é zero.

Para testar o desafio **Desafio de boas-vindas**, encontre seu identificador em `GET /desafios`. Use as operações de início e conclusão do desafio e conclua a missão vinculada antes de finalizá-lo. A rota `GET /conteudos` informa os materiais liberados pelo nível e pelo XP. Para conferir o compartilhamento, use `POST /conquistas/{id}/compartilhar` com uma conquista obtida e abra a URL retornada.

## 5. Criar uma conta administrativa

Em uma instância que você administra, execute o comando abaixo no PowerShell 7 depois de preparar o banco. Use um e-mail reservado à administração e uma senha exclusiva de 12 a 72 caracteres. A senha fica oculta durante a digitação.

```powershell
$env:ADMIN_NAME = Read-Host 'Nome do administrador'
$env:ADMIN_EMAIL = Read-Host 'E-mail do administrador'
$env:ADMIN_PASSWORD = Read-Host 'Senha do administrador' -MaskInput
try {
    npm run admin:create
    if ($LASTEXITCODE -ne 0) { throw 'A criação do administrador falhou.' }
} finally {
    Remove-Item Env:ADMIN_NAME, Env:ADMIN_EMAIL, Env:ADMIN_PASSWORD
}
```

Entre no site com essa conta e abra `/api/docs` para testar as operações do grupo **Administração**. Para confirmar o acesso, use `GET /admin/usuarios`. Um administrador pode consultar usuários e gerenciar o catálogo conforme as rotas documentadas.

## 6. Reproduzir a implantação no Render

1. No painel do Render, selecione **New → Blueprint** e conecte o repositório do GitHub. Escolha a branch `main` e a configuração da raiz em [`render.yaml`](../render.yaml). [Documentação de Blueprints do Render](https://render.com/docs/infrastructure-as-code).
2. Confira os recursos e aplique a configuração. O Blueprint cria um serviço Node.js e um PostgreSQL, conecta os dois por `DATABASE_URL` e gera o `JWT_SECRET`.
3. O Render instala as dependências com `cd backend && npm ci`. Na inicialização, `npm run start:render` executa as migrações, aplica os dados de demonstração e inicia a aplicação.
4. Quando o serviço estiver pronto, abra o endereço HTTPS atribuído pelo Render. Confira `/api/health`, `/api/docs` e o fluxo do site. Inclua o endereço validado no README da sua implantação.

O plano gratuito tem limites de disponibilidade e prazo de expiração para o banco. [Limites do plano gratuito do Render](https://render.com/docs/free).
