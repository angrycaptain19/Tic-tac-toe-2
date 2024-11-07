class GameManager {
    constructor() {
        this.currentGame = null;
        this.games = {};
        this.initializeGameButtons();
    }

    initializeGameButtons() {
        const buttons = document.querySelectorAll('.game-button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const gameType = button.dataset.game;
                this.switchGame(gameType);
            });
        });
    }

    registerGame(gameType, gameClass) {
        this.games[gameType] = gameClass;
    }

    switchGame(gameType) {
        // Hide all game containers
        document.querySelectorAll('.game-container').forEach(container => {
            container.style.display = 'none';
        });

        // Clean up current game if exists
        if (this.currentGame && this.currentGame.cleanup) {
            this.currentGame.cleanup();
        }

        // Show selected game container
        const gameContainer = document.getElementById(`${gameType}-game`);
        if (gameContainer) {
            gameContainer.style.display = 'block';
        }

        // Initialize new game
        if (this.games[gameType]) {
            this.currentGame = new this.games[gameType]();
            this.currentGame.initialize();
        }
    }
}

// Initialize game manager
const gameManager = new GameManager();
