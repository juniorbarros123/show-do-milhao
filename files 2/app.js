// ============================================================
// SHOW DO MILHÃO - SINCRONIZAÇÃO VIA FIREBASE REALTIME DATABASE
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyDpo-p3sNg66Ao_HNR2yHNhMkO6tf4hgW8",
  authDomain: "show-do-bilh.firebaseapp.com",
  databaseURL: "https://show-do-bilh-default-rtdb.firebaseio.com",
  projectId: "show-do-bilh",
  storageBucket: "show-do-bilh.firebasestorage.app",
  messagingSenderId: "621717522935",
  appId: "1:621717522935:web:6e5b64e676c7b5fb3606f2"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const ROOM = "sala1";
const stateRef = db.ref(`${ROOM}/state`);
const eventsRef = db.ref(`${ROOM}/events`);

let myRole = null;
let myPlayerId = null;
let myPlayerName = null;

const audioFiles = { bg: null, correct: null, wrong: null, champion: null };
const audioEls = { bg: new Audio(), correct: new Audio(), wrong: new Audio(), champion: new Audio() };
audioEls.bg.loop = true;

function loadAudio(key, input) {
  const file = input.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  audioFiles[key] = url;
  audioEls[key].src = url;
}

function toggleAudioPanel() {
  document.getElementById('audio-panel').classList.toggle('hidden');
}

let state = {
  phase: 'lobby',
  players: {},
  currentQuestionIndex: 0,
  timer: QUESTION_TIME_SECONDS,
  answers: {},
  rescueVotes: {},
  rescueCandidate: null,
  championId: null,
};

let timerInterval = null;

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function goToHost() {
  myRole = 'host';
  initHostLobby();
  showScreen('screen-host-lobby');
}

function goToPlayer() {
  myRole = 'player';
  showScreen('screen-player-join');
}

function getAvatarHTML(player) {
  const initials = player.name.slice(0,2).toUpperCase();
  return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-weight:800;background:var(--blue);color:#fff;">${initials}</div>`;
}

function initHostLobby() {
  state = {
    phase: 'lobby',
    players: {},
    currentQuestionIndex: 0,
    timer: QUESTION_TIME_SECONDS,
    answers: {},
    rescueVotes: {},
    rescueCandidate: null,
    championId: null,
  };

  eventsRef.remove();

  const baseUrl = window.location.origin + window.location.pathname;
  const joinUrl = baseUrl + '#join';
  const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(joinUrl)}`;
  document.getElementById('qr-img').src = qrApi;

  renderLobby();
  pushState();
  listenToEvents();
}

function pushState() {
  stateRef.set(state);
}

function renderLobby() {
  const players = Object.values(state.players);
  document.getElementById('lobby-count').textContent = players.length;
  const wrap = document.getElementById('lobby-players');
  wrap.innerHTML = players.map(p => `
    <div class="lobby-chip">
      <div class="avatar">${p.name.slice(0,2).toUpperCase()}</div>
      ${p.name}
    </div>
  `).join('');
}

function hostStartGame() {
  if (Object.keys(state.players).length === 0) {
    alert('Aguardando jogadores entrarem...');
    return;
  }
  state.phase = 'question';
  state.currentQuestionIndex = 0;
  startQuestionRound();
}

function startQuestionRound() {
  state.answers = {};
  state.timer = QUESTION_TIME_SECONDS;
  state.phase = 'question';
  state.rescueCandidate = null;

  const q = QUESTIONS[state.currentQuestionIndex];
  renderHostQuestion(q);
  pushState();

  if (audioFiles.bg) {
    audioEls.bg.currentTime = 0;
    audioEls.bg.play().catch(()=>{});
  }

  document.getElementById('btn-reveal').disabled = false;
  document.getElementById('btn-next').disabled = true;
  document.getElementById('btn-rescue').style.display = 'none';

  clearInterval(timerInterval);
  let lastPushed = QUESTION_TIME_SECONDS;
  timerInterval = setInterval(() => {
    state.timer -= 0.1;
    if (state.timer <= 0) {
      state.timer = 0;
      clearInterval(timerInterval);
      updateTimerUI();
      stateRef.child('timer').set(0);
      // pequeno atraso para garantir que respostas enviadas no último instante
      // (gravadas no Firebase) cheguem antes de revelar a resposta
      setTimeout(hostRevealAnswer, 600);
      return;
    }
    updateTimerUI();
    if (Math.abs(lastPushed - state.timer) >= 0.4 || state.timer === 0) {
      stateRef.child('timer').set(Math.round(state.timer * 10) / 10);
      lastPushed = state.timer;
    }
  }, 100);
}

function updateTimerUI() {
  const pct = Math.max(0, (state.timer / QUESTION_TIME_SECONDS) * 100);
  const bar = document.getElementById('timer-bar');
  if (bar) bar.style.width = pct + '%';
  const num = document.getElementById('timer-num');
  if (num) num.textContent = Math.ceil(state.timer);
}

function renderHostQuestion(q) {
  showScreen('screen-host-question');
  document.getElementById('q-number').textContent = state.currentQuestionIndex + 1;
  document.getElementById('q-total').textContent = QUESTIONS.length;
  document.getElementById('q-value').textContent = 'R$ ' + q.value.toLocaleString('pt-BR');
  document.getElementById('q-text').textContent = q.text;
  updateTimerUI();

  const letters = ['A','B','C','D'];
  const grid = document.getElementById('options-grid');
  grid.innerHTML = q.options.map((opt, i) => `
    <div class="option ${letters[i]}" id="opt-${i}">
      <div class="shape">${letters[i]}</div>
      <div>${opt}</div>
    </div>
  `).join('');
  document.getElementById('answer-stats').textContent = '';
  updateAliveBanner();
}

function updateAliveBanner() {
  const players = Object.values(state.players);
  const alive = players.filter(p => p.alive).length;
  const c1 = document.getElementById('alive-count');
  const t1 = document.getElementById('total-count');
  if (c1) c1.textContent = alive;
  if (t1) t1.textContent = players.length;
  const c2 = document.getElementById('alive-count-2');
  const t2 = document.getElementById('total-count-2');
  if (c2) c2.textContent = alive;
  if (t2) t2.textContent = players.length;
}

function hostRevealAnswer() {
  clearInterval(timerInterval);
  audioEls.bg.pause();

  state.phase = 'reveal';
  const q = QUESTIONS[state.currentQuestionIndex];

  document.getElementById(`opt-${q.correct}`).classList.add('correct');

  const BASE_POINTS = 1000;
  let correctCount = 0;
  let wrongCount = 0;

  // pulos: não pontuam, não contam como erro
  Object.entries(state.answers).forEach(([pid, ans]) => {
    if (ans.skipped) {
      const player = state.players[pid];
      if (player) {
        player.lastCorrect = null;
        player.lastAnswerTime = ans.timeMs;
        player.lastPointsGained = 0;
      }
    }
  });

  // respostas normais: ganha pontos se acertar, nada se errar (sem eliminação direta)
  Object.entries(state.answers).forEach(([pid, ans]) => {
    if (ans.skipped) return;
    const player = state.players[pid];
    if (!player) return;
    const isCorrect = ans.optionIndex === q.correct;
    player.lastCorrect = isCorrect;
    player.lastAnswerTime = ans.timeMs;

    if (isCorrect) {
      correctCount++;
      const timeRatio = Math.max(0, 1 - (ans.timeMs / (QUESTION_TIME_SECONDS * 1000)));
      const pts = Math.round(BASE_POINTS * (0.5 + 0.5 * timeRatio));
      player.points += pts;
      player.lastPointsGained = pts;
    } else {
      wrongCount++;
      player.lastPointsGained = 0;
    }
  });

  // quem não respondeu: conta como erro (sem pontos), tempo = tempo total
  Object.values(state.players).forEach(p => {
    if (!(p.id in state.answers) && p.alive) {
      p.lastCorrect = false;
      p.lastPointsGained = 0;
      p.lastAnswerTime = QUESTION_TIME_SECONDS * 1000;
      wrongCount++;
    }
  });

  // ELIMINAÇÃO POR ÚLTIMO LUGAR: a partir da pergunta 3 (índice >= 2), elimina o último do ranking
  let lastPlaceEliminated = null;
  if (state.currentQuestionIndex >= 2) {
    const aliveBefore = Object.values(state.players).filter(p => p.alive);
    if (aliveBefore.length > 1) {
      const sorted = aliveBefore.slice().sort((a, b) => {
        if (a.points !== b.points) return a.points - b.points; // menor pontuação primeiro
        const ta = a.lastAnswerTime ?? Infinity;
        const tb = b.lastAnswerTime ?? Infinity;
        return tb - ta; // maior tempo de resposta primeiro (pior desempate)
      });
      const loser = sorted[0];
      loser.alive = false;
      lastPlaceEliminated = loser.name;
    }
  }

  document.getElementById('answer-stats').textContent = lastPlaceEliminated
    ? `${correctCount} acertaram · ${wrongCount} erraram ou não responderam · eliminado: ${lastPlaceEliminated}`
    : `${correctCount} acertaram · ${wrongCount} erraram ou não responderam`;

  if (lastPlaceEliminated && audioFiles.wrong) {
    audioEls.wrong.currentTime = 0;
    audioEls.wrong.play().catch(()=>{});
  } else if (audioFiles.correct) {
    audioEls.correct.currentTime = 0;
    audioEls.correct.play().catch(()=>{});
  }

  document.getElementById('btn-reveal').disabled = true;
  document.getElementById('btn-next').disabled = false;

  const aliveCount = Object.values(state.players).filter(p=>p.alive).length;
  if (lastPlaceEliminated && aliveCount > 0) {
    document.getElementById('btn-rescue').style.display = 'inline-flex';
  }

  pushState();
}

function hostStartRescue() {
  state.phase = 'rescue';
  state.rescueVotes = {};
  document.getElementById('btn-rescue').style.display = 'none';
  pushState();

  setTimeout(() => {
    tallyRescueVotes();
  }, 15000);
}

function tallyRescueVotes() {
  const votes = {};
  Object.values(state.rescueVotes || {}).forEach(votedId => {
    votes[votedId] = (votes[votedId] || 0) + 1;
  });
  let winnerId = null;
  let max = 0;
  Object.entries(votes).forEach(([pid, count]) => {
    if (count > max) { max = count; winnerId = pid; }
  });
  // Resgate só ocorre com mais de 1 voto (não basta o próprio eliminado votar em si mesmo)
  if (winnerId && max > 1 && state.players[winnerId]) {
    state.players[winnerId].alive = true;
    state.players[winnerId].rescued = true;
  }
  state.phase = 'reveal';
  pushState();
}

function hostNextQuestion(fromRanking) {
  if (!fromRanking) {
    state.phase = 'ranking';
    renderRanking();
    showScreen('screen-host-ranking');
    pushState();
    return;
  }

  state.currentQuestionIndex++;

  const aliveCount = Object.values(state.players).filter(p=>p.alive).length;
  const isLastQuestion = state.currentQuestionIndex >= QUESTIONS.length;

  if (isLastQuestion || aliveCount <= 1) {
    declareChampion();
    return;
  }

  startQuestionRound();
}

function renderRanking() {
  updateAliveBanner();
  const players = Object.values(state.players)
    .sort((a,b) => {
      if (b.points !== a.points) return b.points - a.points;
      const ta = a.lastAnswerTime ?? Infinity;
      const tb = b.lastAnswerTime ?? Infinity;
      return ta - tb;
    });

  const list = document.getElementById('ranking-list');
  list.innerHTML = players.map((p, i) => `
    <div class="rank-row ${i===0?'top1':''} ${!p.alive?'eliminated':''}">
      <div class="pos">${i+1}</div>
      <div class="avatar">${getAvatarHTML(p)}</div>
      <div class="name">${p.name}${p.rescued ? ' 🙌' : ''}</div>
      <div class="pts">${p.points} pts</div>
    </div>
  `).join('');
}

function declareChampion() {
  state.phase = 'champion';
  const players = Object.values(state.players)
    .sort((a,b) => {
      if (b.points !== a.points) return b.points - a.points;
      const ta = a.lastAnswerTime ?? Infinity;
      const tb = b.lastAnswerTime ?? Infinity;
      return ta - tb;
    });
  const champion = players.find(p => p.alive) || players[0];
  state.championId = champion ? champion.id : null;

  showScreen('screen-host-champion');
  if (champion) {
    document.getElementById('champion-avatar').innerHTML = getAvatarHTML(champion);
    document.getElementById('champion-name').textContent = champion.name;
    document.getElementById('champion-points').textContent = champion.points + ' pontos';
  }
  launchConfetti();
  if (audioFiles.champion) {
    audioEls.champion.currentTime = 0;
    audioEls.champion.play().catch(()=>{});
  }
  pushState();
}

function launchConfetti() {
  const colors = ['#ffd54a','#2ecc71','#3a8dde','#e74c3c','#ffffff'];
  for (let i=0; i<80; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.left = Math.random()*100 + 'vw';
    el.style.background = colors[Math.floor(Math.random()*colors.length)];
    el.style.animationDuration = (2 + Math.random()*2) + 's';
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 4000);
  }
}

function restartGame() {
  document.querySelectorAll('.confetti').forEach(c=>c.remove());
  initHostLobby();
  showScreen('screen-host-lobby');
}

function playerJoin() {
  const name = document.getElementById('player-name-input').value.trim();
  if (!name) { alert('Digite seu nome'); return; }
  myPlayerName = name;
  myPlayerId = 'p_' + Math.random().toString(36).slice(2,9);

  eventsRef.push({
    type: 'player_join',
    payload: { id: myPlayerId, name },
    ts: Date.now()
  });

  document.getElementById('player-welcome').textContent = `Bem-vindo, ${name}!`;
  document.getElementById('player-avatar').innerHTML = getAvatarHTML({name});
  showScreen('screen-player-waiting');

  listenToState();
}

let playerHasAnswered = false;
let playerSkipsUsed = 0;
let lastRenderedPhase = null;
let lastRenderedQuestionIndex = -1;

function renderPlayerQuestion() {
  const q = QUESTIONS[state.currentQuestionIndex];
  playerHasAnswered = false;

  const me = state.players[myPlayerId];
  document.getElementById('player-points-live').textContent = me ? me.points : 0;

  if (me && !me.alive) {
    showScreen('screen-player-eliminated');
    updateRescueVoteButton('btn-rescue-vote-2');
    return;
  }

  showScreen('screen-player-question');
  document.getElementById('player-status').textContent = 'Vivo';

  const letters = ['A','B','C','D'];
  const wrap = document.getElementById('player-options');
  wrap.innerHTML = q.options.map((opt, i) => `
    <button class="player-option ${letters[i]}" onclick="playerAnswer(${i})">
      <span class="shape">${letters[i]}</span>
    </button>
  `).join('');

  const skipsLeft = TOTAL_SKIPS_PER_PLAYER - playerSkipsUsed;
  const skipBtn = document.getElementById('btn-skip');
  skipBtn.disabled = skipsLeft <= 0;
  document.getElementById('skip-count').textContent = skipsLeft > 0 ? `${skipsLeft} disponível` : 'esgotado';

  document.getElementById('btn-rescue-vote').style.display = 'none';
}

function playerAnswer(optionIndex) {
  if (playerHasAnswered) return;
  playerHasAnswered = true;

  document.querySelectorAll('.player-option').forEach((el,i) => {
    el.classList.add('locked');
    if (i === optionIndex) el.style.outline = '4px solid #fff';
  });

  const timeMs = (QUESTION_TIME_SECONDS - state.timer) * 1000;
  eventsRef.push({
    type: 'player_answer',
    payload: { id: myPlayerId, optionIndex, timeMs },
    ts: Date.now()
  });
}

function playerUseSkip() {
  if (playerHasAnswered) return;
  if (playerSkipsUsed >= TOTAL_SKIPS_PER_PLAYER) return;
  playerSkipsUsed++;
  playerHasAnswered = true;
  document.querySelectorAll('.player-option').forEach(el => el.classList.add('locked'));
  eventsRef.push({
    type: 'player_skip',
    payload: { id: myPlayerId },
    ts: Date.now()
  });
  document.getElementById('player-feedback-text').textContent = 'Pergunta pulada!';
  document.getElementById('player-feedback-text').className = 'feedback-banner';
  document.getElementById('player-feedback-points').textContent = 'Você segue na disputa, sem pontos nesta rodada.';
  showScreen('screen-player-feedback');
}

function updateRescueVoteButton(btnId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (state.phase === 'rescue') {
    btn.style.display = 'flex';
  } else {
    btn.style.display = 'none';
  }
}

function playerVoteRescue() {
  const eliminatedList = Object.values(state.players).filter(p => p.alive === false);
  if (eliminatedList.length === 0) return;

  // Se houver apenas 1 eliminado e for o próprio jogador, ele não pode votar em si mesmo
  if (eliminatedList.length === 1 && eliminatedList[0].id === myPlayerId) {
    alert('Você não pode votar para resgatar a si mesmo.');
    return;
  }

  // jogador não pode votar para resgatar a si mesmo, mesmo havendo outros eliminados
  const target = eliminatedList.find(p => p.id !== myPlayerId) || eliminatedList[0];

  eventsRef.push({
    type: 'rescue_vote',
    payload: { voterId: myPlayerId, votedFor: target.id },
    ts: Date.now()
  });
  alert(`Voto registrado para resgatar: ${target.name}`);
}

function showPlayerFeedback() {
  const me = state.players[myPlayerId];
  if (!me) return;

  if (me.lastCorrect === true) {
    document.getElementById('player-feedback-text').textContent = 'Você acertou! 🎉';
    document.getElementById('player-feedback-text').className = 'feedback-banner correct';
    document.getElementById('player-feedback-points').textContent = `+${me.lastPointsGained} pontos`;
    if (audioFiles.correct) { audioEls.correct.currentTime = 0; audioEls.correct.play().catch(()=>{}); }
  } else if (me.lastCorrect === false) {
    document.getElementById('player-feedback-text').textContent = 'Você errou!';
    document.getElementById('player-feedback-text').className = 'feedback-banner wrong';
    document.getElementById('player-feedback-points').textContent = me.alive ? '' : 'Você foi eliminado.';
    if (audioFiles.wrong) { audioEls.wrong.currentTime = 0; audioEls.wrong.play().catch(()=>{}); }
  } else {
    return;
  }
  showScreen('screen-player-feedback');
}

function renderPlayerRanking() {
  const me = state.players[myPlayerId];
  if (!me) return;
  document.getElementById('player-points-live').textContent = me.points;

  if (state.phase === 'champion') {
    showScreen('screen-player-champion');
    if (state.championId === myPlayerId) {
      document.getElementById('player-champion-title').textContent = '🏆 Você é o campeão! 🏆';
      document.getElementById('player-final-name').textContent = me.name;
      document.getElementById('player-final-msg').textContent = `${me.points} pontos. Parabéns!`;
      launchConfetti();
    } else {
      document.getElementById('player-champion-title').textContent = 'Fim de jogo!';
      document.getElementById('player-final-name').textContent = me.alive ? 'Quase lá!' : 'Jogo encerrado';
      document.getElementById('player-final-msg').textContent = `Você fez ${me.points} pontos. Confira o ranking no telão!`;
    }
    return;
  }

  if (!me.alive) {
    showScreen('screen-player-eliminated');
    updateRescueVoteButton('btn-rescue-vote-2');
  } else {
    showPlayerFeedback();
  }
}

function listenToState() {
  stateRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (!data) return;
    state = data;
    state.players = state.players || {};
    state.answers = state.answers || {};
    state.rescueVotes = state.rescueVotes || {};

    if (myRole === 'player') {
      const el = document.getElementById('player-timer');
      if (el) el.textContent = Math.ceil(state.timer);

      const phaseChanged = state.phase !== lastRenderedPhase;
      const questionChanged = state.currentQuestionIndex !== lastRenderedQuestionIndex;

      if (state.phase === 'question' && (phaseChanged || questionChanged)) {
        renderPlayerQuestion();
      } else if (state.phase === 'reveal' && phaseChanged) {
        renderPlayerRanking();
      } else if (state.phase === 'rescue') {
        updateRescueVoteButton('btn-rescue-vote');
        updateRescueVoteButton('btn-rescue-vote-2');
      } else if (state.phase === 'champion' && phaseChanged) {
        renderPlayerRanking();
      }

      lastRenderedPhase = state.phase;
      lastRenderedQuestionIndex = state.currentQuestionIndex;
    }

    if (myRole === 'host') {
      if (state.phase === 'lobby') {
        renderLobby();
      }
    }
  });
}

function listenToEvents() {
  eventsRef.on('child_added', (snapshot) => {
    const { type, payload } = snapshot.val();

    if (type === 'player_join') {
      if (!state.players[payload.id]) {
        state.players[payload.id] = {
          id: payload.id,
          name: payload.name,
          points: 0,
          alive: true,
          skipsUsed: 0,
          lastCorrect: null,
          lastAnswerTime: null,
          lastPointsGained: 0,
          rescued: false,
        };
        renderLobby();
        pushState();
      }
    }
    if (type === 'player_answer') {
      if (!state.answers[payload.id]) {
        state.answers[payload.id] = { optionIndex: payload.optionIndex, timeMs: payload.timeMs };
      }
    }
    if (type === 'player_skip') {
      if (state.phase === 'question') {
        const p = state.players[payload.id];
        if (p) {
          p.skipsUsed = (p.skipsUsed || 0) + 1;
          state.answers[payload.id] = { optionIndex: -1, timeMs: QUESTION_TIME_SECONDS*1000, skipped: true };
        }
      }
    }
    if (type === 'rescue_vote') {
      if (state.phase === 'rescue') {
        state.rescueVotes[payload.voterId] = payload.votedFor;
      }
    }

    snapshot.ref.remove();
  });
}

window.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash === '#join') {
    goToPlayer();
  } else {
    goToHost();
  }
});
