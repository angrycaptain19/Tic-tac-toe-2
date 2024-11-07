document.addEventListener('DOMContentLoaded', function() {
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
        card.addEventListener('click', function() {
            const game = this.dataset.game;
            if (game === 'tictactoe') {
                window.location.href = 'games/tictactoe.html';
            } else if (game === 'chess') {
                window.location.href = 'games/chess.html';
            }
        });
    });
});
