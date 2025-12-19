const SIZE = 10;
const MINE_COUNT = 15;
let board = [];
let revealedCount = 0;
let gameOver = false;

const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');

function initGame() {
    // Clear previous state
    boardElement.innerHTML = '';
    board = [];
    revealedCount = 0;
    gameOver = false;
    statusElement.innerText = "Left-click: Reveal | Right-click: Flag";

    // Create Mine Positions
    const positions = Array.from({length: SIZE * SIZE}, (_, i) => i);
    const minePositions = new Set(positions.sort(() => Math.random() - 0.5).slice(0, MINE_COUNT));

    // Build Grid
    for (let r = 0; r < SIZE; r++) {
        board[r] = [];
        for (let c = 0; c < SIZE; c++) {
            const isMine = minePositions.has(r * SIZE + c);
            const cell = { r, c, isMine, revealed: false, flagged: false, neighborMines: 0 };
            board[r][c] = cell;

            const div = document.createElement('div');
            div.classList.add('cell');
            div.id = `cell-${r}-${c}`;
            
            div.addEventListener('click', () => reveal(r, c));
            div.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleFlag(r, c);
            });
            
            boardElement.appendChild(div);
        }
    }

    // Calculate Neighbors
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (!board[r][c].isMine) {
                board[r][c].neighborMines = getNeighbors(r, c).filter(n => n.isMine).length;
            }
        }
    }
}

function getNeighbors(r, c) {
    const neighbors = [];
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            if (board[r + dr] && board[r + dr][c + dc]) {
                neighbors.push(board[r + dr][c + dc]);
            }
        }
    }
    return neighbors;
}

function reveal(r, c) {
    const cell = board[r][c];
    if (gameOver || cell.revealed || cell.flagged) return;

    cell.revealed = true;
    revealedCount++;
    const el = document.getElementById(`cell-${r}-${c}`);
    el.classList.add('revealed');

    if (cell.isMine) {
        el.classList.add('mine');
        el.innerText = '💣';
        endGame(false);
        return;
    }

    if (cell.neighborMines > 0) {
        el.innerText = cell.neighborMines;
        el.classList.add(`c${cell.neighborMines}`);
    } else {
        getNeighbors(r, c).forEach(n => reveal(n.r, n.c));
    }

    if (revealedCount === SIZE * SIZE - MINE_COUNT) endGame(true);
}

function toggleFlag(r, c) {
    const cell = board[r][c];
    if (gameOver || cell.revealed) return;
    cell.flagged = !cell.flagged;
    document.getElementById(`cell-${r}-${c}`).classList.toggle('flag');
}

function endGame(won) {
    gameOver = true;
    statusElement.innerText = won ? "YOU WIN! 🎉" : "GAME OVER! 💥";
}

resetBtn.addEventListener('click', initGame);


initGame();