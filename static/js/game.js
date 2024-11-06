document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const resetButton = document.getElementById('reset');
    const currentPlayerSpan = document.getElementById('current-player');
    
    cells.forEach(cell => {
        cell.addEventListener('click', handleMove);
    });
    
    resetButton.addEventListener('click', resetGame);
    
    function handleMove(event) {
        const cell = event.target;
        const position = cell.dataset.index;
        
        fetch('/make_move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ position: position })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateBoard(data.board);
                currentPlayerSpan.textContent = data.current_player;
                
                if (data.winner) {
                    if (data.winner === 'tie') {
                        alert("It's a tie!");
                    } else {
                        alert(`Player ${data.winner} wins!`);
                    }
                }
            }
        })
        .catch(error => console.error('Error:', error));
    }
    
    function updateBoard(boardState) {
        cells.forEach((cell, index) => {
            cell.textContent = boardState[index];
        });
    }
    
    function resetGame() {
        fetch('/reset', {
            method: 'POST',
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateBoard(data.board);
                currentPlayerSpan.textContent = data.current_player;
            }
        })
        .catch(error => console.error('Error:', error));
    }
});
