from flask import Flask, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit

app = Flask(__name__)
CORS(app)  # Это позволит всем доменам делать запросы
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/data', methods=['POST'])
def receive_data():
    data = request.get_json()
    user_id = data['id']
    username = data['username']
    language_code = data['language_code']

    print(f"User ID: {user_id}")
    print(f"Username: {username}")
    print(f"Language Code: {language_code}")

    return 'Data received!', 200

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    socketio.run(app, port=5000)
