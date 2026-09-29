# Dota Overlay

Overlay de análise de draft para Dota 2, feito para uso pessoal e fins de estudo. Roda como um app Electron separado do jogo e mostra, por cima da tela, informações sobre a composição inimiga, sugestões de item e os melhores counters para o time adversário.

> Feito a fim de estudos.

## Por que é seguro para o VAC

O programa **nunca lê a memória do processo do Dota, nunca injeta código nele e nunca intercepta pacotes de rede**. Ele se apoia em dois canais 100% oficiais/externos:

- **Game State Integration (GSI)**: recurso da própria Valve. O Dota lê um arquivo `.cfg` e envia o estado do jogo (seu herói, o mapa, a partida) via HTTP para `localhost`.
- **OpenDota API**: dados públicos de winrate e matchups de heróis.

Os heróis inimigos são digitados manualmente por você durante o draft, já que o GSI não expõe os picks do time adversário para quem está jogando (só para espectadores/coaches).

## Funcionalidades

- Detecta automaticamente **seu herói** e o **início de cada partida** via GSI.
- Você digita os **5 inimigos** e até **4 aliados** com um atalho de teclado.
- **Análise da composição inimiga**: quantidade de controle, dano de habilidade, iniciação, escape, push, heróis melee e invisíveis.
- **Análise do seu time**: avisa o que está faltando (controle, iniciação, frontline, suporte, carry).
- **Sugestão de itens** com base na composição do inimigo (ex.: muito controle → BKB/Manta/Lotus Orb).
- **Alertas específicos por herói** para casos que fogem da regra geral (Axe, Doom, Bloodseeker, Legion Commander, Silencer, etc.).
- **Melhores counters** sugeridos contra o time inimigo, com base no winrate agregado da OpenDota.
- **Winrate do seu herói** contra cada inimigo específico.
- **Cache em disco**, com validade de alguns dias, para abrir instantâneo e sobreviver a quedas de internet.
- **Painel arrastável e redimensionável**, com posição e tamanho salvos entre sessões.

## Requisitos

- [Node.js](https://nodejs.org/) instalado.
- Dota 2 configurado em **janela sem bordas** (Borderless Windowed) — em tela cheia exclusiva o overlay não aparece por cima.

## Instalação

```bash
npm install
```

## Configurar o GSI (obrigatório)

1. Na Steam, clique com o botão direito em **Dota 2 → Gerenciar → Explorar arquivos locais**.
2. Vá até `game\dota\cfg\`. Se a pasta `gamestate_integration` não existir, crie-a.
3. Dentro dela, crie o arquivo `gamestate_integration_dotaoverlay.cfg` com este conteúdo:

```
"Dota Overlay"
{
    "uri"       "http://127.0.0.1:3000/"
    "timeout"   "5.0"
    "buffer"    "0.1"
    "throttle"  "0.1"
    "heartbeat" "30.0"
    "data"
    {
        "provider"  "1"
        "map"       "1"
        "player"    "1"
        "hero"      "1"
        "abilities" "1"
        "items"     "1"
        "draft"     "1"
    }
}
```

4. Feche o Dota 2 completamente (o jogo só lê essa pasta ao abrir).

## Como rodar

```bash
npm start
```

Abra o Dota 2 depois de rodar o comando. O overlay aparece transparente por cima do jogo.

## Como usar durante a partida

| Tecla | Ação |
|---|---|
| **F10** | Liga/desliga o modo de digitação (confira qual está configurada no `main.js`) |
| **Tab** (com o modo de digitação ativo) | Alterna entre digitar inimigo ou aliado |
| **Enter** | Confirma o herói digitado |
| **Backspace** (campo vazio) | Remove o último herói adicionado à lista ativa |
| **F8** | Mostra/esconde o overlay inteiro |

Durante o draft (ou assim que ver os heróis inimigos), ative o modo de digitação, digite os 5 inimigos e, se quiser, seus aliados, e desative de novo para voltar a jogar normalmente.

## Gerando um executável (opcional)

Para não depender de `npm start` toda vez:

```bash
npm run dist
```

Isso gera um `.exe` portátil em `dist/`, que pode ser aberto direto ou fixado na barra de tarefas.

## Estrutura do projeto

```
dota-overlay/
├── main.js         # processo principal do Electron: janela, servidor GSI, cache em disco, atalhos
├── preload.js       # ponte seguro entre main.js e a página do overlay
├── index.html       # interface do overlay (toda a lógica de análise roda aqui)
├── icon.ico         # ícone usado ao empacotar o executável
└── package.json
```

## Limitações conhecidas

- Os heróis inimigos são inseridos manualmente: o GSI não expõe os picks do time adversário durante a partida.
- Os winrates e matchups vêm da OpenDota e misturam todos os brackets de habilidade — não são filtrados por elo.
- Os alertas por herói (ex.: "atravessa BKB") descrevem mecânicas que podem mudar de patch em patch; sempre valem mais que a dica do overlay o tooltip atual da habilidade no jogo.
- A tradução de nomes de heróis/itens não é feita — tudo aparece em inglês, como retornado pela OpenDota.

## Aviso

Este projeto é para estudo pessoal. Ele não modifica o jogo, não automatiza ações e não lê nada que a Valve não exponha oficialmente via GSI ou que já esteja disponível publicamente via API.
