const rounds = [3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
const storageKey = 'five-crowns-mobile-state-v2';
const pickerValues = Array.from({ length: 201 }, (_, i) => i);

const playerCountEl = document.getElementById('playerCount');
const playerNamesEl = document.getElementById('playerNames');
const buildGameButton = document.getElementById('buildGameButton');
const clearSavedButton = document.getElementById('clearSavedButton');
const newGameButton = document.getElementById('newGameButton');
const gameSection = document.getElementById('gameSection');
const setupSection = document.getElementById('setupSection');
const roundChips = document.getElementById('roundChips');
const roundCards = document.getElementById('roundCards');

let state = {
  players: [],
  scores: {},
  activeRound: 0,
  started: false,
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
      started: true,
    };
  }

  state.started = true;
  renderGame();
  saveState();
}

function renderGame() {
  if (!state.players.length) return;

  if (state.started) {
    setupSection.classList.add('hidden');
    gameSection.classList.remove('hidden');
  }

  renderRoundChips();
  renderRoundCards();
}

function renderRoundChips() {
  roundChips.innerHTML = '';
  rounds.forEach((label, index) => {
    const chip = document.createElement('button');
    chip.className = `round-chip ${index === state.activeRound ? 'active' : ''}`;
    chip.textContent = String(label);
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
      <div class="player-head">
        <div>
          <h3>${player}</h3>
          <div class="muted">Round ${cards}</div>
        </div>
        <button class="secondary edit-name" data-player="${player}">Edit</button>
      </div>
      <div class="score-row">
        <label for="score-${safeId(player)}">Score</label>
        <input id="score-${safeId(player)}" type="number" min="0" step="1" inputmode="numeric" value="${currentValue}" />
        <select id="picker-${safeId(player)}">
          <option value="">Pick</option>
          ${pickerValues.map((value) => `<option value="${value}" ${String(currentValue) === String(value) ? 'selected' : ''}>${value}</option>`).join('')}
        </select>
      </div>
      <div class="total">Total: ${total}</div>
    `;

    const input = card.querySelector('input');
    const picker = card.querySelector('select');
    const editButton = card.querySelector('.edit-name');

    input.addEventListener('input', (event) => {
      state.scores[player][roundIndex] = event.target.value;
      saveState();
      renderRoundCards();
    });

    picker.addEventListener('change', (event) => {
      state.scores[player][roundIndex] = event.target.value;
      saveState();
      renderRoundCards();
    });

    editButton.addEventListener('click', () => editPlayerName(player));

    roundCards.appendChild(card);
  });
}

function editPlayerName(oldName) {
  const nextName = window.prompt('Edit player name', oldName)?.trim();
  if (!nextName || nextName === oldName) return;
  if (state.players.includes(nextName)) return;

  const index = state.players.indexOf(oldName);
  if (index === -1) return;

  state.players[index] = nextName;
  state.scores[nextName] = state.scores[oldName] || Array(rounds.length).fill('');
  delete state.scores[oldName];
  saveState();
  renderGame();
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
  state = { players: [], scores: {}, activeRound: 0, started: false };
  gameSection.classList.add('hidden');
  setupSection.classList.remove('hidden');
  renderPlayerInputs();
}

function safeId(value) {
  return value.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
}

playerCountEl.addEventListener('change', renderPlayerInputs);
buildGameButton.addEventListener('click', () => buildGame(false));
clearSavedButton.addEventListener('click', clearSaved);
newGameButton.addEventListener('click', clearSaved);

renderPlayerInputs();
loadState();
