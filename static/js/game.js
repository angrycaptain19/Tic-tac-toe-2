document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const resetButton = document.getElementById('reset');
    const currentPlayerSpan = document.getElementById('current-player');
    
    let gameState = {
        board: ["", "", "", "", "", "", "", "", ""],
        currentPlayer: 'X',
        player1Score: 0,
        player2Score: 0,
        isPlayer1X: true
    };
    
    cells.forEach(cell => {
        cell.addEventListener('click', handleMove);
    });
    
    const resetScoreButton = document.getElementById('resetScore');
    const player1ScoreDisplay = document.getElementById('player1Score');
    const player2ScoreDisplay = document.getElementById('player2Score');
    
    resetButton.addEventListener('click', resetGame);
    resetScoreButton.addEventListener('click', resetScore);
    
    function updateScoreboard() {
        player1ScoreDisplay.textContent = gameState.player1Score;
        player2ScoreDisplay.textContent = gameState.player2Score;
    }
    
    function resetScore() {
        gameState.player1Score = 0;
        gameState.player2Score = 0;
        updateScoreboard();
    }
    
    function handleMove(event) {
        const cell = event.target;
        const position = parseInt(cell.dataset.index);
        
        if (gameState.board[position] === "") {
            gameState.board[position] = gameState.currentPlayer;
            updateBoard(gameState.board);
            
            const winner = checkWinner(gameState.board);
            if (winner) {
                if (winner === 'tie') {
                    alert("It's a tie!");
                } else {
                    // Update score
                    if (winner === 'X') {
                        gameState.player1Score += gameState.isPlayer1X ? 1 : 0;
                        gameState.player2Score += gameState.isPlayer1X ? 0 : 1;
                    } else {
                        gameState.player1Score += gameState.isPlayer1X ? 0 : 1;
                        gameState.player2Score += gameState.isPlayer1X ? 1 : 0;
                    }
                    updateScoreboard();
                    alert(`Player ${winner} wins! Score - X: ${gameState.player1Score}, O: ${gameState.player2Score}`);
                }
                // Start new game after a brief delay
                setTimeout(() => {
                    resetBoard();
                }, 500);
                return;
            }
            
            gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
            currentPlayerSpan.textContent = gameState.currentPlayer;
        }
    }
    
    function checkWinner(board) {
        const winCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Columns
            [0, 4, 8], [2, 4, 6]  // Diagonals
        ];
        
        for (let combo of winCombinations) {
            if (board[combo[0]] === board[combo[1]] && 
                board[combo[1]] === board[combo[2]] && 
                board[combo[0]] !== "") {
                return board[combo[0]];
            }
        }
        
        if (!board.includes("")) {
            return "tie";
        }
        return null;
    }
    
    function updateBoard(boardState) {
        cells.forEach((cell, index) => {
            cell.textContent = boardState[index];
        });
    }
    
    function resetBoard() {
        gameState.board = ["", "", "", "", "", "", "", "", ""];
        gameState.isPlayer1X = !gameState.isPlayer1X; // Alternate who starts
        gameState.currentPlayer = 'X';
        updateBoard(gameState.board);
        currentPlayerSpan.textContent = gameState.currentPlayer;
    }

    function resetGame() {
        resetBoard();
        resetScore();
    }
});
