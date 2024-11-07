document.addEventListener('DOMContentLoaded', function() {
    const board = document.getElementById('chess-board');
    const status = document.getElementById('status');
    const resetButton = document.getElementById('reset-game');
    const capturedWhite = document.getElementById('captured-pieces-white');
    const capturedBlack = document.getElementById('captured-pieces-black');
    
    let selectedPiece = null;
    let currentPlayer = 'white';
    let gameState = initializeBoard();

    function initializeBoard() {
        const initialState = {
            pieces: new Map(),
            capturedPieces: { white: [], black: [] }
        };

        // Initialize board layout
        const layout = {
            'a8': '♜', 'b8': '♞', 'c8': '♝', 'd8': '♛', 'e8': '♚', 'f8': '♝', 'g8': '♞', 'h8': '♜',
            'a7': '♟', 'b7': '♟', 'c7': '♟', 'd7': '♟', 'e7': '♟', 'f7': '♟', 'g7': '♟', 'h7': '♟',
            'a2': '♙', 'b2': '♙', 'c2': '♙', 'd2': '♙', 'e2': '♙', 'f2': '♙', 'g2': '♙', 'h2': '♙',
            'a1': '♖', 'b1': '♘', 'c1': '♗', 'd1': '♕', 'e1': '♔', 'f1': '♗', 'g1': '♘', 'h1': '♖'
        };

        // Create board squares
        for (let row = 8; row >= 1; row--) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                const position = String.fromCharCode(97 + col) + row;
                square.className = `chess-square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.position = position;
                
                if (layout[position]) {
                    square.textContent = layout[position];
                    initialState.pieces.set(position, {
                        piece: layout[position],
                        color: layout[position].charCodeAt(0) >= 9818 ? 'black' : 'white'
                    });
                }
                
                square.addEventListener('click', handleSquareClick);
                board.appendChild(square);
            }
        }

        return initialState;
    }

    function handleSquareClick(event) {
        const square = event.target;
        const position = square.dataset.position;
        const piece = gameState.pieces.get(position);

        // Clear previous selections
        clearHighlights();

        if (selectedPiece) {
            if (isValidMove(selectedPiece.position, position)) {
                movePiece(selectedPiece.position, position);
                selectedPiece = null;
                currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
                status.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`;
            } else {
                selectedPiece = null;
            }
        } else if (piece && piece.color === currentPlayer) {
            selectedPiece = { position, ...piece };
            square.classList.add('selected-piece');
            showValidMoves(position);
        }
    }

    function isValidMove(from, to) {
        const piece = gameState.pieces.get(from);
        const targetPiece = gameState.pieces.get(to);
        
        if (targetPiece && targetPiece.color === piece.color) {
            return false;
        }
        
        // Basic movement validation - can be expanded for specific piece rules
        return true;
    }

    function movePiece(from, to) {
        const piece = gameState.pieces.get(from);
        const targetPiece = gameState.pieces.get(to);
        
        if (targetPiece) {
            gameState.capturedPieces[currentPlayer].push(targetPiece.piece);
            updateCapturedPieces();
        }
        
        gameState.pieces.delete(from);
        gameState.pieces.set(to, piece);
        updateBoard();
    }

    function updateBoard() {
        const squares = board.getElementsByClassName('chess-square');
        Array.from(squares).forEach(square => {
            const position = square.dataset.position;
            const piece = gameState.pieces.get(position);
            square.textContent = piece ? piece.piece : '';
        });
    }

    function updateCapturedPieces() {
        capturedWhite.textContent = gameState.capturedPieces.white.join(' ');
        capturedBlack.textContent = gameState.capturedPieces.black.join(' ');
    }

    function clearHighlights() {
        const squares = board.getElementsByClassName('chess-square');
        Array.from(squares).forEach(square => {
            square.classList.remove('selected-piece', 'valid-move');
        });
    }

    function showValidMoves(position) {
        // Implement valid move highlighting based on piece type
        // This is a simplified version that highlights all empty squares
        const squares = board.getElementsByClassName('chess-square');
        Array.from(squares).forEach(square => {
            if (!gameState.pieces.get(square.dataset.position)) {
                square.classList.add('valid-move');
            }
        });
    }

    resetButton.addEventListener('click', function() {
        board.innerHTML = '';
        currentPlayer = 'white';
        status.textContent = "White's Turn";
        gameState = initializeBoard();
        capturedWhite.textContent = '';
        capturedBlack.textContent = '';
    });
});
