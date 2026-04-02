from flask import Flask, render_template, jsonify, request
import json
import os
import secrets

app = Flask(__name__)

KEY_FILE = "api_key.json"

# Créer le fichier JSON s'il n'existe pas
def init_key_file():
    if not os.path.exists(KEY_FILE):
        with open(KEY_FILE, "w") as f:
            json.dump({"key": "Aucune clé"}, f)

init_key_file()

# Page principale (chat)
@app.route("/")
def home():
    return render_template("index.html")

# Page key
@app.route("/key.html")
def key_page():
    return render_template("key.html")

# Récupérer la clé
@app.route("/get_key")
def get_key():
    with open(KEY_FILE, "r") as f:
        data = json.load(f)
    return jsonify(data)

# Générer une nouvelle clé
@app.route("/generate_key", methods=["POST"])
def generate_key():
    new_key = secrets.token_hex(16)

    with open(KEY_FILE, "w") as f:
        json.dump({"key": new_key}, f)

    print("Nouvelle clé générée :", new_key)  # pour debug
    return jsonify({"key": new_key})

if __name__ == "__main__":
    app.run(debug=True)