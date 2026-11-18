# Modelagem conceitual — Nexa Play

Este modelo descreve as informações mantidas pela API. O diagrama completo com chaves está em [DER.md](DER.md); os atributos e restrições estão em [modelagem-logica.md](modelagem-logica.md).

## Entidades

- **Empresa** organiza os jogos publicados pela plataforma.
- **Jogo** reúne jornadas, desafios e conteúdos.
- **Usuário** é uma pessoa cadastrada, com perfil de jogador ou administrador.
- **Jornada** organiza uma sequência de missões de um jogo.
- **Missão** é uma atividade de uma jornada; pode ser de confirmação ou quiz.
- **Questão de missão** contém o enunciado, alternativas e resposta de uma missão.
- **Progresso do usuário** registra a participação de um usuário em uma missão, seu estado e XP obtido.
- **Desafio** associa um jogo a uma missão e tem período e recompensa próprios.
- **Participação em desafio** registra o estado e o XP de um usuário em um desafio.
- **Nível** define um patamar de XP e um título. Não há chave estrangeira para usuário: o nível é calculado a partir do progresso.
- **Conquista** define um objetivo que pode ser alcançado por um usuário.
- **Usuário-conquista** registra as conquistas obtidas pelos usuários e quando foram conquistadas.
- **Conteúdo** é um material de um jogo, com requisitos de nível e XP.
- **Compartilhamento** é um link de conquista de um usuário, com token e possível expiração ou revogação.

## Relacionamentos e cardinalidades

| Relação | Cardinalidade |
|---|---|
| Empresa — Jogo | Uma empresa possui zero ou mais jogos; cada jogo pertence a uma empresa. |
| Jogo — Jornada | Um jogo possui zero ou mais jornadas; cada jornada pertence a um jogo. |
| Jornada — Missão | Uma jornada possui zero ou mais missões; cada missão pertence a uma jornada. |
| Missão — Questão | Uma missão possui zero ou mais questões; cada questão pertence a uma missão. |
| Usuário — Missão | Muitos para muitos, por meio de Progresso do usuário. Há no máximo um registro por usuário e missão. |
| Jogo — Desafio | Um jogo possui zero ou mais desafios; cada desafio pertence a um jogo. |
| Missão — Desafio | Uma missão pode estar em zero ou mais desafios; cada desafio aponta para uma missão. |
| Usuário — Desafio | Muitos para muitos, por meio de Participação em desafio. Há no máximo um registro por usuário e desafio. |
| Usuário — Conquista | Muitos para muitos, por meio de Usuário-conquista. Cada combinação ocorre no máximo uma vez. |
| Jogo — Conteúdo | Um jogo possui zero ou mais conteúdos; cada conteúdo pertence a um jogo. |
| Usuário — Compartilhamento — Conquista | Cada compartilhamento pertence a um usuário e aponta para uma conquista; um usuário ou uma conquista pode ter vários compartilhamentos. |

Os requisitos de nível e XP em jornadas, missões e conteúdos são números consultados pela aplicação, sem relacionamento físico com a tabela de níveis. O esquema de compartilhamentos referencia usuário e conquista separadamente; a aplicação deve verificar se a conquista pertence ao usuário.
