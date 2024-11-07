document.addEventListener('DOMContentLoaded', function() {
    const board = document.getElementById('chess-board');
    const status = document.getElementById('status');
    const resetButton = document.getElementById('reset-game');
    const capturedWhite = document.getElementById('captured-pieces-white');
    const capturedBlack = document.getElementById('captured-pieces-black');
    const modal = document.getElementById('game-mode-modal');
    const computerStatus = document.getElementById('computer-status');
    
    let selectedPiece = null;
    let currentPlayer = 'white';
    let gameState = null;
    let gameMode = null;
    let computerDifficulty = null;
    let isComputerThinking = false;

    // Show game mode selection on start
    showGameModeSelection();

    function showGameModeSelection() {
        modal.classList.remove('hidden');
        document.getElementById('one-player').addEventListener('click', () => {
            document.getElementById('difficulty-select').classList.remove('hidden');
        });
        
        document.getElementById('two-player').addEventListener('click', () => {
            gameMode = '2player';
            modal.classList.add('hidden');
            startNewGame();
        });

        document.querySelectorAll('#difficulty-select button').forEach(button => {
            button.addEventListener('click', (e) => {
                gameMode = '1player';
                computerDifficulty = e.target.dataset.difficulty;
                modal.classList.add('hidden');
                startNewGame();
            });
        });
    }

    function startNewGame() {
        gameState = initializeBoard();
        currentPlayer = 'white';
        status.textContent = "White's Turn";
        updateBoard();
    }

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
        if (isComputerThinking || (gameMode === '1player' && currentPlayer === 'black')) {
            return;
        }
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
                
                if (gameMode === '1player' && currentPlayer === 'black') {
                    makeComputerMove();
                }
            } else {
                selectedPiece = null;
            }
        } else if (piece && piece.color === currentPlayer) {
            selectedPiece = { position, ...piece };
            square.classList.add('selected-piece');
            showValidMoves(position);
        }
    }

    function getSquaresBetween(from, to) {
        const squares = [];
        const [fromCol, fromRow] = [from.charCodeAt(0) - 97, parseInt(from[1])];
        const [toCol, toRow] = [to.charCodeAt(0) - 97, parseInt(to[1])];
        
        const colStep = Math.sign(toCol - fromCol);
        const rowStep = Math.sign(toRow - fromRow);
        
        let currentCol = fromCol + colStep;
        let currentRow = fromRow + rowStep;
        
        while (currentCol !== toCol || currentRow !== toRow) {
            squares.push(String.fromCharCode(97 + currentCol) + currentRow);
            if (currentCol !== toCol) currentCol += colStep;
            if (currentRow !== toRow) currentRow += rowStep;
        }
        
        return squares;
    }

    function isPathClear(from, to) {
        const squares = getSquaresBetween(from, to);
        return squares.every(square => !gameState.pieces.has(square));
    }

    function isValidMove(from, to) {
        const piece = gameState.pieces.get(from);
        const targetPiece = gameState.pieces.get(to);
        
        if (!piece || (targetPiece && targetPiece.color === piece.color)) {
            return false;
        }

        const [fromCol, fromRow] = [from.charCodeAt(0) - 97, parseInt(from[1]) - 1];
        const [toCol, toRow] = [to.charCodeAt(0) - 97, parseInt(to[1]) - 1];
        const colDiff = Math.abs(toCol - fromCol);
        const rowDiff = Math.abs(toRow - fromRow);

        switch (piece.piece) {
            case '♙': // White pawn
                if (fromCol === toCol) {
                    if (toRow === fromRow + 1) return !targetPiece;
                    if (fromRow === 1 && toRow === fromRow + 2) {
                        return !targetPiece && isPathClear(from, to);
                    }
                }
                return false;
            case '♟': // Black pawn
                if (fromCol === toCol) {
                    if (toRow === fromRow - 1) return !targetPiece;
                    if (fromRow === 6 && toRow === fromRow - 2) {
                        return !targetPiece && isPathClear(from, to);
                    }
                }
                return false;
            case '♖': case '♜': // Rook
                return (fromCol === toCol || fromRow === toRow) && isPathClear(from, to);
            case '♗': case '♝': // Bishop
                return colDiff === rowDiff && isPathClear(from, to);
            case '♕': case '♛': // Queen
                return (fromCol === toCol || fromRow === toRow || colDiff === rowDiff) && isPathClear(from, to);
            case '♔': case '♚': // King
                return colDiff <= 1 && rowDiff <= 1;
            case '♘': case '♞': // Knight
                return (colDiff === 2 && rowDiff === 1) || (colDiff === 1 && rowDiff === 2);
        }
        return false;
    }

    async function makeComputerMove() {
        isComputerThinking = true;
        computerStatus.classList.remove('hidden');
        
        // Simulate thinking time
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simple computer strategy: randomly select a valid move
        const possibleMoves = [];
        gameState.pieces.forEach((piece, from) => {
            if (piece.color === 'black') {
                const squares = board.getElementsByClassName('chess-square');
                Array.from(squares).forEach(square => {
                    const to = square.dataset.position;
                    if (isValidMove(from, to)) {
                        possibleMoves.push({ from, to });
                    }
                });
            }
        });

        if (possibleMoves.length > 0) {
            const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            movePiece(move.from, move.to);
            currentPlayer = 'white';
            status.textContent = "White's Turn";
        }

        isComputerThinking = false;
        computerStatus.classList.add('hidden');
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
        const squares = board.getElementsByClassName('chess-square');
        Array.from(squares).forEach(square => {
            const targetPos = square.dataset.position;
            if (isValidMove(position, targetPos)) {
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
