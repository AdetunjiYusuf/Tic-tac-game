// Match and Game Variables
const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

const cells = document.querySelectorAll('.cell');
const statusDisplay = document.querySelector('.status');
const startMatchBtn = document.getElementById('startMatchBtn');
const nextRoundBtn = document.getElementById('nextRoundBtn');
const restartMatchBtn = document.getElementById('restartMatchBtn');

const openSetupBtn = document.getElementById('openSetupBtn');
const exitMatchBtn = document.getElementById('exitMatchBtn');

const setupPanel = document.getElementById('setup');
const scoreboardPanel = document.getElementById('scoreboard');
const namesSingle = document.getElementById('namesSingle');
const namesMulti = document.getElementById('namesMulti');

const p1Label = document.getElementById('p1Label');
const p2Label = document.getElementById('p2Label');
const p1ScoreEl = document.getElementById('p1Score');
const p2ScoreEl = document.getElementById('p2Score');
const roundLabel = document.getElementById('roundLabel');
const matchStatusEl = document.getElementById('matchStatus');

let mode = 'single'; // 'single' or 'multi'
let player1Name = 'Player 1';
let player2Name = 'Player 2';
let totalRounds = 7;
let currentRound = 1;
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = false;
let currentPlayer = 'X'; // 'X' or 'O'
let scores = {p1:0, p2:0, draws:0};

// Wire up mode radio toggles
document.getElementsByName('mode').forEach(r => r.addEventListener('change', (e)=>{
    mode = e.target.value;
    if (mode === 'single') {
        namesSingle.classList.remove('hidden');
        namesMulti.classList.add('hidden');
    } else {
        namesSingle.classList.add('hidden');
        namesMulti.classList.remove('hidden');
    }
}));

// Open setup button toggles the setup panel
if (openSetupBtn) {
    openSetupBtn.addEventListener('click', ()=>{
        setupPanel.classList.remove('hidden');
        openSetupBtn.classList.add('hidden');
    });
}

if (exitMatchBtn) {
    exitMatchBtn.addEventListener('click', exitMatch);
}

// Cell clicks
cells.forEach(cell => cell.addEventListener('click', onCellClick));

startMatchBtn.addEventListener('click', startMatch);
nextRoundBtn.addEventListener('click', nextRound);
restartMatchBtn.addEventListener('click', restartMatch);

function startMatch() {
    // Read names
    if (mode === 'single') {
        const v = document.getElementById('player1Name').value.trim();
        player1Name = v || 'You';
        player2Name = 'Computer';
    } else {
        const a = document.getElementById('player1NameMulti').value.trim();
        const b = document.getElementById('player2NameMulti').value.trim();
        player1Name = a || 'Player 1';
        player2Name = b || 'Player 2';
    }

    // Reset scores & round
    scores = {p1:0, p2:0, draws:0};
    currentRound = 1;

    // Update UI
    p1Label.textContent = `${player1Name} (X)`;
    p2Label.textContent = `${player2Name} (O)`;
    updateScoresUI();
    roundLabel.textContent = `Round ${currentRound} / ${totalRounds}`;
    matchStatusEl.textContent = '';

    setupPanel.classList.add('hidden');
    scoreboardPanel.classList.remove('hidden');

    // Start first round, X goes first
    currentPlayer = 'X';
    resetBoard();
    gameActive = true;
    statusDisplay.textContent = `${player1Name}'s Turn (X)`;

    // hide the open-setup button when match starts
    if (openSetupBtn) openSetupBtn.classList.add('hidden');
    if (exitMatchBtn) exitMatchBtn.classList.remove('hidden');

    // If single-player and computer starts (if we choose to alternate, we keep X starting first round)
    if (mode === 'single' && currentPlayer === 'O') {
        // if O should start, call computerMove
        setTimeout(computerMove, 400);
    }
}

function onCellClick(e) {
    if (!gameActive) return;
    const cell = e.target;
    const idx = parseInt(cell.getAttribute('data-cell-index'));
    if (gameBoard[idx] !== '') return;

    // In single-player, prevent clicking when it's computer turn
    if (mode === 'single' && currentPlayer === 'O' && player2Name === 'Computer') return;

    makeMove(idx, currentPlayer);
}

function makeMove(idx, symbol) {
    gameBoard[idx] = symbol;
    const el = document.querySelector(`.cell[data-cell-index='${idx}']`);
    el.textContent = symbol;
    el.classList.add(symbol.toLowerCase());

    const result = checkResult();
    if (result) {
        endRound(result);
        return;
    }

    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurnText();

    if (mode === 'single' && currentPlayer === 'O' && player2Name === 'Computer') {
        setTimeout(computerMove, 400);
    }
}

function computerMove() {
    if (!gameActive) return;
    // pick random available cell
    const avail = gameBoard.map((v,i)=> v===''?i:null).filter(v=>v!==null);
    if (avail.length === 0) return;

    // Simple AI: try to win/block very simply, else random
    // Try winning move
    for (let i of avail) {
        const copy = gameBoard.slice(); copy[i] = 'O';
        if (isWinner(copy, 'O')) { makeMove(i, 'O'); return; }
    }
    // Try block
    for (let i of avail) {
        const copy = gameBoard.slice(); copy[i] = 'X';
        if (isWinner(copy, 'X')) { makeMove(i, 'O'); return; }
    }

    const choice = avail[Math.floor(Math.random()*avail.length)];
    makeMove(choice, 'O');
}

function isWinner(board, symbol) {
    return winPatterns.some(p => board[p[0]]===symbol && board[p[1]]===symbol && board[p[2]]===symbol);
}

function checkResult() {
    // Check winner
    for (let p of winPatterns) {
        const [a,b,c] = p;
        if (gameBoard[a] && gameBoard[a]===gameBoard[b] && gameBoard[a]===gameBoard[c]) {
            return gameBoard[a]; // 'X' or 'O'
        }
    }
    // Draw
    if (!gameBoard.includes('')) return 'draw';
    return null;
}

function endRound(result) {
    gameActive = false;
    if (result === 'draw') {
        matchStatusEl.textContent = `Round ${currentRound} ended in a draw.`;
        scores.draws++;
    } else if (result === 'X') {
        matchStatusEl.textContent = `${player1Name} (X) wins Round ${currentRound}!`;
        scores.p1++;
    } else if (result === 'O') {
        matchStatusEl.textContent = `${player2Name} (O) wins Round ${currentRound}!`;
        scores.p2++;
    }

    updateScoresUI();

    if (currentRound >= totalRounds) {
        // Match over
        showMatchResult();
    } else {
        nextRoundBtn.classList.remove('hidden');
    }
}

function showMatchResult() {
    // Determine match winner
    let message = '';
    if (scores.p1 > scores.p2) message = `${player1Name} wins the match!`;
    else if (scores.p2 > scores.p1) message = `${player2Name} wins the match!`;
    else message = `Match ended in a tie.`;
    matchStatusEl.textContent = message + ` Final: ${scores.p1} - ${scores.p2} (Draws: ${scores.draws})`;
    restartMatchBtn.classList.remove('hidden');
}

function nextRound() {
    currentRound++;
    roundLabel.textContent = `Round ${currentRound} / ${totalRounds}`;
    nextRoundBtn.classList.add('hidden');
    resetBoard();
    gameActive = true;

    // Alternate who starts: X starts on odd rounds
    currentPlayer = (currentRound % 2 === 1) ? 'X' : 'O';
    updateTurnText();

    if (mode === 'single' && currentPlayer === 'O' && player2Name === 'Computer') {
        setTimeout(computerMove, 400);
    }
}

function restartMatch() {
    // Reset UI to setup
    setupPanel.classList.remove('hidden');
    scoreboardPanel.classList.add('hidden');
    restartMatchBtn.classList.add('hidden');
    nextRoundBtn.classList.add('hidden');
    matchStatusEl.textContent = '';
    statusDisplay.textContent = 'Waiting to start match';
    resetBoard();

    // show open setup button so user can re-open setup
    if (openSetupBtn) openSetupBtn.classList.remove('hidden');
    if (exitMatchBtn) exitMatchBtn.classList.add('hidden');
}

function exitMatch() {
    // stop current match and return to setup
    gameActive = false;
    resetBoard();
    setupPanel.classList.remove('hidden');
    scoreboardPanel.classList.add('hidden');
    matchStatusEl.textContent = '';
    statusDisplay.textContent = 'Match exited. Open setup to start again.';
    // show open setup button and hide exit
    if (openSetupBtn) openSetupBtn.classList.remove('hidden');
    if (exitMatchBtn) exitMatchBtn.classList.add('hidden');
    // hide next/restart controls
    nextRoundBtn.classList.add('hidden');
    restartMatchBtn.classList.add('hidden');
}

function updateScoresUI() {
    p1ScoreEl.textContent = scores.p1;
    p2ScoreEl.textContent = scores.p2;
}

function updateTurnText() {
    if (!gameActive) return;
    if (currentPlayer === 'X') statusDisplay.textContent = `${player1Name}'s Turn (X)`;
    else statusDisplay.textContent = `${player2Name}'s Turn (O)`;
}

function resetBoard() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    cells.forEach(c => { c.textContent = ''; c.classList.remove('x','o'); });
    gameActive = false; // will be set true by caller when round is active
}