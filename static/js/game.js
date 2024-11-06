document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const resetButton = document.getElementById('reset');
    const currentPlayerSpan = document.getElementById('current-player');
    
    let gameState = {
        board: ["", "", "", "", "", "", "", "", ""],
        currentPlayer: 'X'
    };
    
    cells.forEach(cell => {
        cell.addEventListener('click', handleMove);
    });
    
    resetButton.addEventListener('click', resetGame);
    
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
                    alert(`Player ${winner} wins!`);
                }
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
    
    function resetGame() {
        gameState = {
            board: ["", "", "", "", "", "", "", "", ""],
            currentPlayer: 'X'
        };
        updateBoard(gameState.board);
        currentPlayerSpan.textContent = gameState.currentPlayer;
    }
});
