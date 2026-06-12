// ============================================================
// BANCO DE PERGUNTAS - EXEMPLO
// Substitua pelo conjunto real de 16 perguntas (4 fases x 4 perguntas)
// Cada pergunta: text, options [A,B,C,D], correct (índice 0-3), value (prêmio acumulado)
// ============================================================

const QUESTIONS = [
  // FASE 1 - R$ 1.000 cada
  { phase: 1, value: 1000, text: "Qual time brasileiro tem mais títulos da Copa Libertadores?", options: ["São Paulo", "Independiente", "Flamengo", "Boca Juniors"], correct: 2 },
  { phase: 1, value: 1000, text: "Em que ano o Brasil conquistou seu primeiro título de Copa do Mundo?", options: ["1950", "1958", "1962", "1970"], correct: 1 },
  { phase: 1, value: 1000, text: "Qual é a capital do estado de Alagoas?", options: ["Recife", "Aracaju", "Maceió", "Salvador"], correct: 2 },
  { phase: 1, value: 1000, text: "Quantos jogadores titulares uma equipe de futebol coloca em campo?", options: ["9", "10", "11", "12"], correct: 2 },

  // FASE 2 - R$ 5.000 cada
  { phase: 2, value: 5000, text: "Qual jogador é conhecido como 'Rei do Futebol'?", options: ["Romário", "Ronaldinho", "Pelé", "Zico"], correct: 2 },
  { phase: 2, value: 5000, text: "Em qual cidade fica o estádio do Maracanã?", options: ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Brasília"], correct: 1 },
  { phase: 2, value: 5000, text: "Quantas Copas do Mundo o Brasil já venceu?", options: ["3", "4", "5", "6"], correct: 2 },
  { phase: 2, value: 5000, text: "Qual destes não é um clube de futebol brasileiro?", options: ["Cruzeiro", "Grêmio", "River Plate", "Internacional"], correct: 2 },

  // FASE 3 - R$ 20.000 cada
  { phase: 3, value: 20000, text: "Quem foi o artilheiro da Copa do Mundo de 2014?", options: ["Neymar", "James Rodríguez", "Thomas Müller", "Lionel Messi"], correct: 1 },
  { phase: 3, value: 20000, text: "Em que ano o Brasil sediou a Copa do Mundo pela segunda vez?", options: ["1950", "2014", "1994", "2002"], correct: 1 },
  { phase: 3, value: 20000, text: "Qual técnico foi campeão mundial pelo Brasil em 2002?", options: ["Telê Santana", "Vanderlei Luxemburgo", "Luiz Felipe Scolari", "Carlos Alberto Parreira"], correct: 2 },
  { phase: 3, value: 20000, text: "Qual destes jogadores nunca jogou na seleção brasileira?", options: ["Kaká", "Cafu", "Iniesta", "Roberto Carlos"], correct: 2 },

  // FASE 4 - R$ 100.000 cada (última = 1.000.000)
  { phase: 4, value: 100000, text: "Qual foi o placar da final da Copa de 2002 entre Brasil e Alemanha?", options: ["1x0", "2x0", "3x1", "2x1"], correct: 1 },
  { phase: 4, value: 100000, text: "Quem marcou o gol do título do Brasil na Copa de 1994 nos pênaltis (decisivo)?", options: ["Romário", "Bebeto", "Taffarel (goleiro defensor)", "Dunga"], correct: 2 },
  { phase: 4, value: 100000, text: "Em qual estádio aconteceu o 'Maracanazo' de 1950?", options: ["Mineirão", "Maracanã", "Morumbi", "Pacaembu"], correct: 1 },
  { phase: 4, value: 1000000, text: "PERGUNTA FINAL: Quantos gols Pelé marcou oficialmente em Copas do Mundo?", options: ["10", "11", "12", "13"], correct: 1 },
];

const QUESTION_TIME_SECONDS = 15; // tempo igual para todas as perguntas
const TOTAL_SKIPS_PER_PLAYER = 1; // "pular pergunta" - 1x por jogador

// Avatares placeholder (iniciais). Substituir por imagens estilo seleção brasileira / desenho animado.
// Para usar imagens reais, troque a função getAvatarHTML() em app.js para retornar
// <img src="avatares/jogador1.png"> etc, distribuindo entre os jogadores.
const AVATAR_PLACEHOLDER = true;
