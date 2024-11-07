class TicTacToe {
    constructor() {
        this.currentPlayer = 'X';
        this.board = Array(9).fill('');
        this.gameActive = true;
        this.cells = document.querySelectorAll('#tictactoe-game .cell');
        this.currentPlayerSpan = document.querySelector('#current-player');
        this.resetButton = document.querySelector('#reset');
    }

    initialize() {
        this.cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
        
        this.resetButton.addEventListener('click', () => this.resetGame());
        this.resetGame();
    }

    handleCellClick(e) {
        const cell = e.target;
        const index = cell.dataset.index;

        if (this.board[index] === '' && this.gameActive) {
            this.board[index] = this.currentPlayer;
            cell.textContent = this.currentPlayer;
            
            if (this.checkWinner()) {
                alert(`Player ${this.currentPlayer} wins!`);
                this.gameActive = false;
            } else if (this.board.every(cell => cell !== '')) {
                alert('Game is a draw!');
                this.gameActive = false;
            } else {
                this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
                this.currentPlayerSpan.textContent = this.currentPlayer;
            }
        }
    }

    checkWinner() {
        const winCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        return winCombinations.some(combo => {
            return this.board[combo[0]] !== '' &&
                this.board[combo[0]] === this.board[combo[1]] &&
                this.board[combo[1]] === this.board[combo[2]];
        });
    }

    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.cells.forEach(cell => cell.textContent = '');
        this.currentPlayerSpan.textContent = this.currentPlayer;
    }

    cleanup() {
        // Remove event listeners if needed
    }
}

// Register the game with the game manager
gameManager.registerGame('tictactoe', TicTacToe);
