const rounds = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const storageKey = 'five-crowns-mobile-state-v1';

const playerCountEl = document.getElementById('playerCount');
const playerNamesEl = document.getElementById('playerNames');
const buildGameButton = document.getElementById('buildGameButton');
const clearSavedButton = document.getElementById('clearSavedButton');
const newGameButton = document.getElementById('newGameButton');
const gameSection = document.getElementById('gameSection');
const roundChips = document.getElementById('roundChips');
const roundCards = document.getElementById('roundCards');

let state = {
  players: [],
  scores: {},
  activeRound: 0,
};

function renderPlayerInputs() {
  const count = Number(playerCountEl.value);
  playerNamesEl.innerHTML = '';
  for (let i = 0; i < count; i += 1) {
    const wrapper = document.createElement('div');
    wrapper.className = 'stack';
    wrapper.innerHTML = `
      <label for="player-${i}">Player ${i + 1}</label>
      <input id="player-${i}" type="text" value="Player ${i + 1}" />
    `;
    playerNamesEl.appendChild(wrapper);
  }
}

function getPlayerNames() {
  return [...playerNamesEl.querySelectorAll('input')].map((input, index) => input.value.trim() || `Player ${index + 1}`);
}

function blankScores(players) {
  const scores = {};
  players.forEach((player) => {
    scores[player] = Array(rounds.length).fill('');
  });
  return scores;
}

function buildGame(fromSaved = false) {
  if (!fromSaved) {
    const players = getPlayerNames();
    state = {
      players,
      scores: blankScores(players),
      activeRound: 0,
    };
  }

  renderGame();
  saveState();
}

function renderGame() {
  if (!state.players.length) return;

  gameSection.classList.remove('hidden');
  renderRoundChips();
  renderRoundCards();
}

function renderRoundChips() {
  roundChips.innerHTML = '';
  rounds.forEach((cards, index) => {
    const chip = document.createElement('button');
    chip.className = `round-chip ${index === state.activeRound ? 'active' : ''}`;
    chip.textContent = `R${index + 1}`;
    chip.addEventListener('click', () => {
      state.activeRound = index;
      renderGame();
      saveState();
    });
    roundChips.appendChild(chip);
  });
}

function renderRoundCards() {
  roundCards.innerHTML = '';
  const roundIndex = state.activeRound;
  const cards = rounds[roundIndex];

  state.players.forEach((player) => {
    const currentValue = state.scores[player]?.[roundIndex] ?? '';
    const total = (state.scores[player] || []).reduce((sum, value) => sum + (Number(value) || 0), 0);

    const card = document.createElement('div');
    card.className = 'player-card';
    card.innerHTML = `
      <h3>${player}</h3>
      <div class="muted">Round ${roundIndex + 1} • ${cards} cards</div>
      <div class="score-row">
        <label for="score-${player}">Score</label>
        <input id="score-${player}" type="number" min="0" step="1" inputmode="numeric" value="${currentValue}" />
      </div>
      <div class="total">Total: ${total}</div>
    `;

    const input = card.querySelector('input');
    input.addEventListener('input', (event) => {
      state.scores[player][roundIndex] = event.target.value;
      saveState();
      renderRoundCards();
    });

    roundCards.appendChild(card);
  });
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed.players || !parsed.scores) return false;
    state = parsed;
    playerCountEl.value = String(parsed.players.length);
    renderPlayerInputs();
    [...playerNamesEl.querySelectorAll('input')].forEach((input, index) => {
      input.value = parsed.players[index] || `Player ${index + 1}`;
    });
    buildGame(true);
    return true;
  } catch {
    return false;
  }
}

function clearSaved() {
  localStorage.removeItem(storageKey);
  state = { players: [], scores: {}, activeRound: 0 };
  gameSection.classList.add('hidden');
  renderPlayerInputs();
}

playerCountEl.addEventListener('change', renderPlayerInputs);
buildGameButton.addEventListener('click', () => buildGame(false));
clearSavedButton.addEventListener('click', clearSaved);
newGameButton.addEventListener('click', clearSaved);

renderPlayerInputs();
loadState();
