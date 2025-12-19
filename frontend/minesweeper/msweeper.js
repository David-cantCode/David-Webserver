// CONFIGURATION
const ROWS = 10;
const COLS = 10;
const MINES = 15;

let grid = [];
let gameOver = false;
let flagsLeft = MINES;

// DOM ELEMENTS
const gridElement = document.getElementById('grid');
const mineCountElement = document.getElementById('mine-count');
const resetBtn = document.getElementById('reset-btn');
const msgElement = document.getElementById('message');

// Set CSS variable for columns so the grid fits perfectly
document.documentElement.style.setProperty('--board-cols', COLS);

function initGame() {
    grid = [];
    gameOver = false;
    flagsLeft = MINES;
    mineCountElement.innerText = flagsLeft;
    resetBtn.innerText = "🙂";
    msgElement.innerText = "";
    gridElement.innerHTML = "";

    // 1. Create Data Structure
    createGridData();
    
    // 2. Plant Mines
    plantMines();
    
    // 3. Calculate Numbers
    calculateNumbers();
    
    // 4. Render Board
    renderBoard();
}

function createGridData() {
    for (let r = 0; r < ROWS; r++) {
        const row = [];
        for (let c = 0; c < COLS; c++) {
            // State for every single cell
            row.push({
                r: r,
                c: c,
                isMine: false,
                revealed: false,
                flagged: false,
                count: 0 // Neighbor mines count
            });
        }
        grid.push(row);
    }
}

function plantMines() {
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);
        
        if (!grid[r][c].isMine) {
            grid[r][c].isMine = true;
            minesPlaced++;
        }
    }
}

function calculateNumbers() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c].isMine) continue;
            
            let count = 0;
            // Check all 8 neighbors
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const nr = r + i;
                    const nc = c + j;
                    // Check bounds and if neighbor is mine
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc].isMine) {
                        count++;
                    }
                }
            }
            grid[r][c].count = count;
        }
    }
}

function renderBoard() {
    gridElement.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('cell');
            cellDiv.dataset.r = r;
            cellDiv.dataset.c = c;
            
            // Left Click
            cellDiv.addEventListener('click', () => handleClick(r, c));
            
            // Right Click (Flag)
            cellDiv.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleRightClick(r, c);
            });
            
            gridElement.appendChild(cellDiv);
        }
    }
}

function handleClick(r, c) {
    if (gameOver) return;
    const cell = grid[r][c];
    
    // Guard Clauses
    if (cell.revealed || cell.flagged) return;

    if (cell.isMine) {
        gameOver = true;
        revealAllMines();
        resetBtn.innerText = "😵";
        msgElement.innerText = "GAME OVER!";
        return;
    }

    revealCell(r, c);
    checkWin();
}

function handleRightClick(r, c) {
    if (gameOver) return;
    const cell = grid[r][c];
    if (cell.revealed) return;

    const cellDiv = getDiv(r, c);

    if (cell.flagged) {
        cell.flagged = false;
        cellDiv.innerText = "";
        cellDiv.classList.remove('flagged');
        flagsLeft++;
    } else {
        if (flagsLeft > 0) {
            cell.flagged = true;
            cellDiv.innerText = "🚩";
            cellDiv.classList.add('flagged');
            flagsLeft--;
        }
    }
    mineCountElement.innerText = flagsLeft;
}

// Recursive Flood Fill
function revealCell(r, c) {
    const cell = grid[r][c];
    if (cell.revealed || cell.flagged) return;

    cell.revealed = true;
    const cellDiv = getDiv(r, c);
    cellDiv.classList.add('revealed');

    if (cell.count > 0) {
        cellDiv.innerText = cell.count;
        cellDiv.classList.add(`num-${cell.count}`);
    } else {
        // If count is 0, reveal neighbors (recursion)
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const nr = r + i;
                const nc = c + j;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                    revealCell(nr, nc);
                }
            }
        }
    }
}

function revealAllMines() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c].isMine) {
                const div = getDiv(r, c);
                div.classList.add('mine');
                div.innerText = "💣";
            }
        }
    }
}

function checkWin() {
    let revealedCount = 0;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c].revealed) revealedCount++;
        }
    }

    if (revealedCount === (ROWS * COLS) - MINES) {
        gameOver = true;
        resetBtn.innerText = "😎";
        msgElement.innerText = "YOU WIN!";
        mineCountElement.innerText = "0";
    }
}

// Helper to find the HTML element based on coordinates
function getDiv(r, c) {
    // We use nth-child. r*COLS + c is the index (0-based), so +1 for nth-child
    const index = r * COLS + c;
    return gridElement.children[index];
}

resetBtn.addEventListener('click', initGame);

// Start
initGame();