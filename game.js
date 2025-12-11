// Game Variables
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

// Winning Combinations
const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Get all cells
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.querySelector('.status');

// Handle Cell Click
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

function handleCellClick(event) {
    const clickedCell = event.target;
    const cellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));
    
    // If cell already filled or game not active, return
    if (gameBoard[cellIndex] !== '' || !gameActive) {
        return;
    }
    
    // Update game board and UI
    gameBoard[cellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
    
    // Check for win or draw
    checkResult();
    
    // Switch player
    if (gameActive) {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusDisplay.textContent = `Player ${currentPlayer}'s Turn`;
    }
}

function checkResult() {
    let roundWon = false;
    
    // Check win patterns
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            roundWon = true;
            break;
        }
    }
    
    if (roundWon) {
        statusDisplay.textContent = `Player ${currentPlayer} Wins! 🎉`;
        gameActive = false;
        return;
    }
    
    // Check for draw
    if (!gameBoard.includes('')) {
        statusDisplay.textContent = "Game ended in a draw! 🤝";
        gameActive = false;
    }
}

function restartGame() {
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    statusDisplay.textContent = "Player X's Turn";
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });
}


// Add to game.js
let scores = {X: 0, O: 0, draws: 0};

function updateScore(winner) {
    if (winner === 'X') scores.X++;
    if (winner === 'O') scores.O++;
    if (winner === 'draw') scores.draws++;
    
    // Display scores
    document.getElementById('scoreDisplay').innerHTML = `
        X: ${scores.X} | O: ${scores.O} | Draws: ${scores.draws}
    `;
}