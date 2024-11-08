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
    let isGameOver = false;

    // Piece values for position evaluation
    const PIECE_VALUES = {
        '♙': 1, '♟': -1,  // Pawns
        '♘': 3, '♞': -3,  // Knights
        '♗': 3, '♝': -3,  // Bishops
        '♖': 5, '♜': -5,  // Rooks
        '♕': 9, '♛': -9,  // Queens
        '♔': 100, '♚': -100  // Kings
    };

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
        isGameOver = false;
        status.textContent = "White's Turn";
        updateBoard();
    }

    function findKingPosition(color) {
        const kingSymbol = color === 'white' ? '♔' : '♚';
        for (const [position, piece] of gameState.pieces) {
            if (piece.piece === kingSymbol) {
                return position;
            }
        }
        return null;
    }

    function isKingInCheck(color) {
        const kingPos = findKingPosition(color);
        if (!kingPos) return false;

        const oppositeColor = color === 'white' ? 'black' : 'white';
        for (const [position, piece] of gameState.pieces) {
            if (piece.color === oppositeColor && isValidMove(position, kingPos, true)) {
                return true;
            }
        }
        return false;
    }

    function isCheckmate(color) {
        if (!isKingInCheck(color)) return false;
        return getAllValidMoves(color).length === 0;
    }

    function isStalemate(color) {
        if (isKingInCheck(color)) return false;
        return getAllValidMoves(color).length === 0;
    }

    function getAllValidMoves(color) {
        const moves = [];
        const squares = board.getElementsByClassName('chess-square');
        
        gameState.pieces.forEach((piece, from) => {
            if (piece.color === color) {
                Array.from(squares).forEach(square => {
                    const to = square.dataset.position;
                    if (isValidMove(from, to, false)) {
                        // Test if move would leave king in check
                        const tempState = simulateMove(from, to);
                        if (!wouldBeInCheck(color, tempState)) {
                            moves.push({ from, to });
                        }
                    }
                });
            }
        });
        return moves;
    }

    function simulateMove(from, to) {
        const tempState = {
            pieces: new Map(gameState.pieces),
            capturedPieces: { 
                white: [...gameState.capturedPieces.white],
                black: [...gameState.capturedPieces.black]
            }
        };
        
        const piece = tempState.pieces.get(from);
        tempState.pieces.delete(from);
        tempState.pieces.set(to, piece);
        
        return tempState;
    }

    function wouldBeInCheck(color, state) {
        const originalState = gameState;
        gameState = state;
        const inCheck = isKingInCheck(color);
        gameState = originalState;
        return inCheck;
    }

    function evaluatePosition() {
        let score = 0;
        gameState.pieces.forEach((piece, position) => {
            score += PIECE_VALUES[piece.piece] || 0;
        });
        return score;
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
        if (isGameOver || isComputerThinking || (gameMode === '1player' && currentPlayer === 'black')) {
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

    function isPathClear(from, to) {
        const [fromCol, fromRow] = [from.charCodeAt(0) - 97, parseInt(from[1]) - 1];
        const [toCol, toRow] = [to.charCodeAt(0) - 97, parseInt(to[1]) - 1];
        
        const colStep = Math.sign(toCol - fromCol) || 0;
        const rowStep = Math.sign(toRow - fromRow) || 0;
        
        let currentCol = fromCol + colStep;
        let currentRow = fromRow + rowStep;
        
        while (currentCol !== toCol || currentRow !== toRow) {
            const position = String.fromCharCode(97 + currentCol) + (currentRow + 1);
            if (gameState.pieces.get(position)) {
                return false;
            }
            currentCol += colStep;
            currentRow += rowStep;
        }
        return true;
    }

    function isValidMove(from, to, ignoreCheck = false) {
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
                if (targetPiece) {
                    // Capture diagonally
                    return Math.abs(toCol - fromCol) === 1 && toRow === fromRow + 1;
                }
                // Move forward
                if (fromCol === toCol && ((toRow === fromRow + 1) || (fromRow === 1 && toRow === fromRow + 2))) {
                    return isPathClear(from, to);
                }
                return false;
            case '♟': // Black pawn
                if (targetPiece) {
                    // Capture diagonally
                    return Math.abs(toCol - fromCol) === 1 && toRow === fromRow - 1;
                }
                // Move forward
                if (fromCol === toCol && ((toRow === fromRow - 1) || (fromRow === 6 && toRow === fromRow - 2))) {
                    return isPathClear(from, to);
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
        if (isGameOver) return;
        
        isComputerThinking = true;
        computerStatus.classList.remove('hidden');
        
        // Add timeout to prevent infinite loops
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Computer move timed out')), 3000)
        );

        try {
            await Promise.race([
                new Promise(async resolve => {
                    const validMoves = getAllValidMoves('black');
                    
                    if (validMoves.length === 0) {
                        resolve(null);
                        return;
                    }

                    // Evaluate each move
                    const moveScores = validMoves.map(move => {
                        const tempState = simulateMove(move.from, move.to);
                        const score = evaluatePosition();
                        return { ...move, score };
                    });

                    // Sort by score and pick best move
                    moveScores.sort((a, b) => b.score - a.score);
                    const bestMove = moveScores[0];

                    // Add small delay to simulate thinking
                    await new Promise(r => setTimeout(r, 500));
                    
                    if (bestMove) {
                        movePiece(bestMove.from, bestMove.to);
                        currentPlayer = 'white';
                        
                        if (isCheckmate('white')) {
                            status.textContent = "Checkmate! Black wins!";
                            isGameOver = true;
                        } else if (isStalemate('white')) {
                            status.textContent = "Stalemate! Game is a draw.";
                            isGameOver = true;
                        } else if (isKingInCheck('white')) {
                            status.textContent = "White is in check!";
                        } else {
                            status.textContent = "White's Turn";
                        }
                    }
                    resolve();
                }),
                timeoutPromise
            ]);
        } catch (error) {
            console.error('Computer move error:', error);
            status.textContent = "Computer move error - please reset game";
            isGameOver = true;
        } finally {
            isComputerThinking = false;
            computerStatus.classList.add('hidden');
        }
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

        // Check for checkmate/stalemate after move
        const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
        if (isCheckmate(nextPlayer)) {
            status.textContent = `Checkmate! ${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} wins!`;
            isGameOver = true;
        } else if (isStalemate(nextPlayer)) {
            status.textContent = "Stalemate! Game is a draw.";
            isGameOver = true;
        } else if (isKingInCheck(nextPlayer)) {
            status.textContent = `${nextPlayer.charAt(0).toUpperCase() + nextPlayer.slice(1)} is in check!`;
        }
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
