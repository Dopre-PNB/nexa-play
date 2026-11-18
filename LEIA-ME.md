# Nexa Play — páginas em HTML e CSS

Site responsivo reconstruído a partir das referências visuais fornecidas. Abra `index.html` no navegador; os arquivos e recursos devem permanecer juntos. Não é necessário instalar dependências.

## Páginas

| Arquivo | Página |
| --- | --- |
| `index.html` | Início |
| `sobre-nos.html` | Sobre |
| `o-que-fazemos.html` | O que fazemos |
| `projetos.html` | Projetos |
| `nexa-quest.html` | Nexa Quest |
| `como-funciona.html` | Como funciona |
| `login.html` | Entrar |
| `cadastro.html` | Criar conta |

O menu móvel é compartilhado pelas páginas e abre com o botão no cabeçalho.

## Arquivos de estilo e recursos

- `styles.css`: tipografia, cores, cabeçalho, navegação, rodapé e páginas de conteúdo.
- `auth.css`: formulários e layouts de entrar e criar conta.
- `assets/quest-card.png`: arte da capa do Nexa Quest usada nas páginas de projeto.
- `assets/nunito-latin.woff2`: fonte local; licença em `assets/OFL-Nunito.txt`.
- `assets/favicon.svg`: ícone da página.

O front-end continua em HTML e CSS. Os formulários têm validação básica do navegador e ainda não enviam dados à API; essa ligação precisará de JavaScript no navegador ou páginas servidas pelo backend.

## Backend

A API REST em Node.js fica na pasta [`backend`](backend/). Consulte [backend/README.md](backend/README.md) para configurar o banco, iniciar o servidor e abrir a documentação interativa.

O arquivo [render.yaml](render.yaml) configura uma demonstração gratuita do site e da API no Render.
