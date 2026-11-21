# Nexa Play

A Nexa Play é uma plataforma de jogos e experiências educativas. O site apresenta o **Nexa Quest** e permite criar e acessar uma conta. A API REST registra o progresso dos jogadores em uma jornada demonstrativa com missões, desafios, pontos de experiência e conquistas.

- **Site publicado** [Nexa Play no Render](https://nexa-play-api-7ida.onrender.com/)
- **Código-fonte** [Dopre-PNB/nexa-play no GitHub](https://github.com/Dopre-PNB/nexa-play)
- **API interativa** [Swagger UI](https://nexa-play-api-7ida.onrender.com/api/docs/)
- **Estado da API e do banco** [Verificação de saúde](https://nexa-play-api-7ida.onrender.com/api/health)

## Objetivo

Demonstrar como uma plataforma educativa pode acompanhar o progresso de cada jogador, atribuir XP ao concluir atividades e liberar conquistas e conteúdos conforme o avanço. O banco relacional armazena as contas, o catálogo do Nexa Quest e os resultados das atividades.

## Funcionalidades

- **No site**, apresentação do projeto, cadastro, login com e-mail e senha, consulta à página da conta e encerramento da sessão.
- **Na API**, autenticação, consulta e edição do perfil, catálogo de jogos e jornadas, missões de confirmação e de quiz, desafios, XP, níveis, conquistas, compartilhamentos e conteúdo desbloqueável.
- **Na administração da API**, gerenciamento de usuários, jogos, jornadas, missões, questões, desafios, níveis, conquistas e conteúdos com uma conta administrativa.

Use o site para criar uma conta e entrar. No mesmo navegador, abra o Swagger UI e consulte `GET /jornadas` para localizar **Primeiros passos**. O roteiro para iniciar e concluir **Boas-vindas** e conferir o progresso está no [guia de instalação e uso](arquivos-adicionais/INSTALACAO-E-USO.md#4-usar-o-site-e-testar-o-progresso).

As missões demonstrativas são executadas pela API. O jogo completo, o acesso por Google ou Apple, a recuperação de senha e os downloads nas lojas ainda estão pendentes.

## Tecnologias

- **Front-end** HTML5, CSS3 e JavaScript.
- **Servidor** Node.js, Express e API REST.
- **Banco de dados** Sequelize com MySQL ou PostgreSQL. O site publicado usa PostgreSQL.
- **Autenticação e validação** bcryptjs, JSON Web Token, cookies HttpOnly, Helmet, express-rate-limit e Zod.
- **Documentação e hospedagem** OpenAPI, Swagger UI, GitHub e Render.

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
├── documentacao/                              # modelos conceitual e lógico e DER
├── arquivos-adicionais/                       # guia de instalação e uso
│   └── sql/                                   # criação e dados iniciais no PostgreSQL
└── render.yaml                                # configuração da hospedagem
```

## Instalação e uso

Para executar localmente, use Node.js 20 ou superior, npm e um servidor MySQL ou PostgreSQL. O guia explica como configurar o ambiente, criar o banco, carregar os dados iniciais, iniciar a aplicação e testar o cadastro e o progresso. [Guia de instalação e uso](arquivos-adicionais/INSTALACAO-E-USO.md).

## Modelagem e banco de dados

Uma empresa publica jogos. Cada jogo organiza jornadas, missões e desafios. As relações entre jogadores e atividades registram o progresso, a participação nos desafios e as conquistas obtidas. O sistema usa o XP acumulado para calcular o nível do jogador e liberar conteúdos.

- [Modelagem conceitual](documentacao/modelagem-conceitual.md).
- [Modelagem lógica](documentacao/modelagem-logica.md).
- [Diagrama entidade-relacionamento (DER)](documentacao/DER.md).
- [Scripts SQL para criar o banco e as tabelas e inserir dados iniciais](arquivos-adicionais/sql/README.md).

## Hospedagem de demonstração

O [`render.yaml`](render.yaml) configura o serviço web e o PostgreSQL. No plano gratuito, o primeiro acesso após um período de inatividade pode demorar cerca de um minuto, e o banco expira após 30 dias da criação. [Limites do plano gratuito do Render](https://render.com/docs/free).
