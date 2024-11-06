from flask import Flask, render_template, jsonify, request, session
import random

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Required for session

def check_winner(board):
    # Check rows, columns and diagonals
    win_combinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  # Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  # Columns
        [0, 4, 8], [2, 4, 6]  # Diagonals
    ]
    
    for combo in win_combinations:
        if board[combo[0]] == board[combo[1]] == board[combo[2]] != "":
            return board[combo[0]]
    
    if "" not in board:
        return "tie"
    return None

@app.route('/')
def index():
    # Initialize game state
    session['board'] = [""] * 9
    session['current_player'] = 'X'
    return render_template('index.html')

@app.route('/make_move', methods=['POST'])
def make_move():
    position = int(request.json['position'])
    board = session.get('board', [""] * 9)
    current_player = session.get('current_player', 'X')
    
    if board[position] == "":
        board[position] = current_player
        winner = check_winner(board)
        
        # Switch player
        session['current_player'] = 'O' if current_player == 'X' else 'X'
        session['board'] = board
        
        return jsonify({
            'success': True,
            'board': board,
            'winner': winner,
            'current_player': session['current_player']
        })
    
    return jsonify({'success': False, 'message': 'Invalid move'})

@app.route('/reset', methods=['POST'])
def reset():
    session['board'] = [""] * 9
    session['current_player'] = 'X'
    return jsonify({
        'success': True,
        'board': session['board'],
        'current_player': session['current_player']
    })

if __name__ == '__main__':
    app.run(debug=True)
