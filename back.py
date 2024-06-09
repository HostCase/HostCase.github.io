from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Это позволит всем доменам делать запросы

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

if __name__ == '__main__':
    app.run(port=5000)
