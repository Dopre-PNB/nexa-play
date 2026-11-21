# Modelagem conceitual — Nexa Play

Este modelo descreve o catálogo da Nexa Play, as contas e o progresso de cada jogador. Consulte as chaves no [DER](DER.md) e os atributos e restrições no [modelo lógico](modelagem-logica.md).

## Entidades

- **Empresa** identifica a organização responsável pelos jogos.
- **Jogo** reúne jornadas, desafios e conteúdos.
- **Usuário** é uma pessoa cadastrada, com perfil de jogador ou administrador.
- **Jornada** organiza uma sequência de missões de um jogo.
- **Missão** é uma atividade de confirmação ou quiz dentro de uma jornada.
- **Questão de missão** contém o enunciado, alternativas e resposta de uma missão.
- **Progresso do usuário** registra a participação de um usuário em uma missão, seu estado e XP obtido.
- **Desafio** associa um jogo a uma missão e tem período e recompensa próprios.
- **Participação em desafio** registra o estado e o XP de um usuário em um desafio.
- **Nível** define um patamar de XP e um título. O nível de cada usuário é calculado a partir do seu progresso.
- **Conquista** define um objetivo que pode ser alcançado por um usuário.
- **Usuário-conquista** registra as conquistas obtidas pelos usuários e quando foram conquistadas.
- **Conteúdo** é um material de um jogo, com requisitos de nível e XP.
- **Compartilhamento** é um link de conquista de um usuário, com token e possível expiração ou revogação.

## Relacionamentos e cardinalidades

| Relação | Cardinalidade |
|---|---|
| Empresa — Jogo | Uma empresa possui zero ou mais jogos. Cada jogo pertence a uma empresa. |
| Jogo — Jornada | Um jogo possui zero ou mais jornadas. Cada jornada pertence a um jogo. |
| Jornada — Missão | Uma jornada possui zero ou mais missões. Cada missão pertence a uma jornada. |
| Missão — Questão | Uma missão possui zero ou mais questões. Cada questão pertence a uma missão. |
| Usuário — Missão | Muitos para muitos, por meio de Progresso do usuário. Há no máximo um registro por usuário e missão. |
| Jogo — Desafio | Um jogo possui zero ou mais desafios. Cada desafio pertence a um jogo. |
| Missão — Desafio | Uma missão pode estar em zero ou mais desafios. Cada desafio aponta para uma missão. |
| Usuário — Desafio | Muitos para muitos, por meio de Participação em desafio. Há no máximo um registro por usuário e desafio. |
| Usuário — Conquista | Muitos para muitos, por meio de Usuário-conquista. Cada combinação ocorre no máximo uma vez. |
| Jogo — Conteúdo | Um jogo possui zero ou mais conteúdos. Cada conteúdo pertence a um jogo. |
| Usuário — Compartilhamento — Conquista | Cada compartilhamento vincula um usuário a uma conquista. Um usuário ou uma conquista pode ter vários compartilhamentos. |

## Regras da aplicação

- Um quiz precisa de pelo menos uma questão para ser publicado. Para jogar uma missão, o jogador deve cumprir o maior dos níveis mínimos definidos na missão e na jornada.
- O desafio vincula uma missão do mesmo jogo. Para receber o bônus, o jogador precisa concluir a missão e finalizar o desafio durante o período de disponibilidade.
- A soma do XP de missões e desafios concluídos determina o nível. A aplicação registra a conquista quando o progresso atinge seu critério e libera conteúdos conforme os requisitos de nível e XP.
- A API permite compartilhar uma conquista ativa que o usuário já obteve. Um compartilhamento pode ser revogado pelo seu autor.
