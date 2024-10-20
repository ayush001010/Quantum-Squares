const BOARD_SIZE = 5;
const CONTROL_THRESHOLD = 4;
const WINNING_SQUARES = 10; 
let board = Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => ({
    particles: " ",
    player: null
})));

let currentPlayer = 1; // Player 1 starts
let playerControlledSquares = { 1: 0, 2: 0 };
let playerPoints = { 1: 0, 2: 0 }; // Initialize points for players

function renderBoard() {
    const gameBoard = document.getElementById("game-board");
    gameBoard.innerHTML = '';  // Clear existing squares

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            let square = document.createElement('div');
            square.classList.add('square');
            square.textContent = board[row][col].particles; // Display particles

            if (board[row][col].player === 1) {
                square.classList.add('player1');
            } else if (board[row][col].player === 2) {
                square.classList.add('player2');
            }

            square.addEventListener('click', () => placeParticle(row, col));
            gameBoard.appendChild(square);
        }
    }
    document.getElementById("current-player").textContent = currentPlayer;
    document.getElementById("error-message").textContent = "";  // Clear error message
    updateScores(); // Update scores display
}

function placeParticle(row, col) {
    // Only place in empty or already owned squares
    if (board[row][col].player !== null && board[row][col].player !== currentPlayer) {
        displayError("You can't place a particle here!");
        return;
    }

    board[row][col].particles++; // Increment particles
    if (board[row][col].player === null) {
        board[row][col].player = currentPlayer; // Set current player as owner (if it was neutral)
    }

    checkForCollapse(row, col); // Check for collapse
    checkForWin(); // Check win conditions

    currentPlayer = currentPlayer === 1 ? 2 : 1; // Switch turns
    renderBoard(); // Re-render the board
}

function checkForCollapse(row, col) {
    if (board[row][col].particles >= CONTROL_THRESHOLD) {
        const particlesToDistribute = board[row][col].particles; // Store particles to redistribute
        const previousPlayer = board[row][col].player; // Store the current player who owns this square

        // Increase points for the collapsing player
        playerPoints[previousPlayer]++;

        // Set the collapsing square to empty
        board[row][col].particles = " ";
        board[row][col].player = null; // Set ownership to null

        let adjacentSquares = getAdjacentSquares(row, col);
        adjacentSquares.forEach(([r, c]) => {
            if (board[r][c].player !== null && board[r][c].player !== previousPlayer) {
                // Increment particles in the adjacent square but do not change ownership
                board[r][c].particles += 1; 
            } else if (board[r][c].player === null) {
                // Neutral square, take ownership
                board[r][c].particles += 1; 
                board[r][c].player = previousPlayer; 
            } else {
                // If the square is controlled by the previous player, increment their controlled squares
                if (board[r][c].player === previousPlayer) {
                    playerControlledSquares[previousPlayer]++;
                }
            }

            // Check if the adjacent square collapses
            checkForCollapse(r, c);
        });
    }
}

function getAdjacentSquares(row, col) {
    let adjacent = [];
    if (row > 0) adjacent.push([row - 1, col]); // Top
    if (row < BOARD_SIZE - 1) adjacent.push([row + 1, col]); // Bottom
    if (col > 0) adjacent.push([row, col - 1]); // Left
    if (col < BOARD_SIZE - 1) adjacent.push([row, col + 1]); // Right
    return adjacent;
}

function checkForWin() {
    playerControlledSquares = { 1: 0, 2: 0 };

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col].player === 1) {
                playerControlledSquares[1]++;
            } else if (board[row][col].player === 2) {
                playerControlledSquares[2]++;
            }
        }
    }

    if (playerControlledSquares[1] >= WINNING_SQUARES) {
        alert("Player 1 wins!");
        resetGame();
    } else if (playerControlledSquares[2] >= WINNING_SQUARES) {
        alert("Player 2 wins!");
        resetGame();
    } else if (isBoardFull()) {
        alert("It's a tie! No more moves available.");
        resetGame();
    }
}

function isBoardFull() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col].particles < CONTROL_THRESHOLD) {
                return false; // If any square is not full
            }
        }
    }
    return true; // All squares are full
}

function displayError(message) {
    document.getElementById("error-message").textContent = message;
}

function resetGame() {
    board = Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => ({
        particles: "",
        player: null
    })));
    playerControlledSquares = { 1: 0, 2: 0 };
    playerPoints = { 1: 0, 2: 0 }; // Reset points
    currentPlayer = 1;
    renderBoard();
}

function updateScores() {
    document.getElementById("player1-points").textContent = playerPoints[1];
    document.getElementById("player2-points").textContent = playerPoints[2];
}

// Initialize the game
renderBoard();