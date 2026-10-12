// data.js
// Dados das etapas do Ciclo da Água.
// Mantido separado da lógica (app.js) para facilitar edição de textos e posições.

const CYCLE_STAGES = [
  {
    id: "evaporacao",
    order: 1,
    icon: "sun",
    sidebarIcon: "sun",
    title: "Evaporação",
    short: "O Sol aquece a água e a transforma em vapor.",
    long: "A energia do Sol aquece oceanos, rios e lagos, fazendo com que parte da água mude do estado líquido para o gasoso, subindo em forma de vapor invisível para a atmosfera.",
    // posição percentual dentro do palco circular (x, y) — 0 a 100
    pos: { x: 78, y: 30 },
    arrowTo: "condensacao"
  },
  {
    id: "condensacao",
    order: 2,
    icon: "cloud",
    sidebarIcon: "cloud",
    title: "Condensação",
    short: "O vapor esfria e forma as nuvens.",
    long: "Ao subir, o vapor de água esfria e se condensa em minúsculas gotículas que se agrupam, formando as nuvens que vemos no céu.",
    pos: { x: 50, y: 15 },
    arrowTo: "precipitacao"
  },
  {
    id: "precipitacao",
    order: 3,
    icon: "rain",
    sidebarIcon: "rain",
    title: "Precipitação",
    short: "A água cai das nuvens em forma de chuva, neve ou granizo.",
    long: "Quando as gotículas nas nuvens se tornam pesadas demais, a água retorna à superfície na forma de chuva, neve ou granizo.",
    pos: { x: 22, y: 30 },
    arrowTo: "infiltracao"
  },
  {
    id: "infiltracao",
    order: 4,
    icon: "infiltration",
    sidebarIcon: "infiltration",
    title: "Infiltração",
    short: "Parte da água penetra no solo.",
    long: "Parte da água da chuva penetra no solo, percolando entre as camadas de terra e rocha até abastecer os lençóis freáticos e reservas subterrâneas.",
    pos: { x: 15, y: 62 },
    arrowTo: "escoamento"
  },
  {
    id: "escoamento",
    order: 5,
    icon: "flow",
    sidebarIcon: "flow",
    title: "Escoamento",
    short: "A água que não infiltra percorre a superfície.",
    long: "A água que não é absorvida pelo solo escoa pela superfície, formando riachos que alimentam rios, lagos e, por fim, os oceanos.",
    pos: { x: 50, y: 78 },
    arrowTo: "acumulo"
  },
  {
    id: "acumulo",
    order: 6,
    icon: "storage",
    sidebarIcon: "storage",
    title: "Acúmulo",
    short: "A água fica armazenada em oceanos, rios, lagos e geleiras.",
    long: "A água se acumula em oceanos, rios, lagos, geleiras e reservas subterrâneas, formando os grandes estoques naturais de onde o ciclo recomeça pela evaporação.",
    pos: { x: 80, y: 62 },
    arrowTo: "evaporacao"
  }
];

const OVERVIEW_CONTENT = {
  title: "Ciclo da Água",
  short: "Explore as etapas do ciclo clicando nos elementos."
};

const WEATHER_CONTENT = {
  title: "Clima e Tempo",
  short: "Condições meteorológicas em tempo real."
};
