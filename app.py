import os
import time
import json
import random
import joblib
import re
import wikipedia
import requests
from bs4 import BeautifulSoup
from difflib import SequenceMatcher
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ======================
# CONFIG WIKIPEDIA
# ======================
wikipedia.set_lang("fr")

# ======================
# CHARGEMENT MODELE
# ======================
try:
    model = joblib.load("chatbot_model.pkl")
    vectorizer = joblib.load("vectorizer.pkl")
    print("✅ Modèle chargé avec succès")
except Exception as e:
    print("❌ Erreur chargement modèle :", e)
    model = None
    vectorizer = None

# ======================
# CHARGEMENT INTENTS
# ======================
def load_intents():
    try:
        with open("data.json", "r", encoding="utf-8") as file:
            data = json.load(file)
            print("✅ Intents chargés")
            return data
    except Exception as e:
        print("❌ Erreur chargement intents :", e)
        return {"intents": []}

intents = load_intents()

# ======================
# FALLBACK RESPONSES
# ======================
fallback_responses = [
    "Je n’ai pas bien compris 🤔, pouvez-vous reformuler ?",
    "Pouvez-vous donner plus de détails ?",
    "Je suis encore en apprentissage 😅",
    "Désolé, je n’ai pas compris votre demande.",
    "Pouvez-vous préciser votre question ?",
    "Je ne suis pas sûr de comprendre 🤷‍♂️"
]

# ======================
# MEMOIRE UTILISATEUR
# ======================
user_memory = {}

# ======================
# NETTOYAGE TEXTE
# ======================
def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

# ======================
# RECHERCHE PATTERN
# ======================
def search_in_patterns(user_input):
    user_input_clean = clean_text(user_input)

    best_score = 0
    best_responses = []

    for intent in intents["intents"]:
        for question in intent.get("questions", []):
            score = SequenceMatcher(
                None,
                user_input_clean,
                clean_text(question)
            ).ratio()

            if score > best_score:
                best_score = score
                best_responses = intent.get("responses", [])

    if best_score >= 0.7:
        return random.choice(best_responses)

    return None

# ======================
# MACHINE LEARNING
# ======================
def predict_intent(text):
    if model is None or vectorizer is None:
        return None, 0

    try:
        X = vectorizer.transform([text])
        prediction = model.predict(X)[0]
        proba = max(model.predict_proba(X)[0]) * 100

        for intent in intents["intents"]:
            if intent["intent"] == prediction:
                responses = intent.get("responses", [])
                if responses:
                    return random.choice(responses), proba

        return None, proba

    except Exception as e:
        print("❌ Erreur ML :", e)
        return None, 0

# ======================
# FILTRE WIKIPEDIA
# ======================
def is_good_wiki_query(text):
    words = text.split()

    if len(words) > 5:
        return False

    blocked = ["achat", "maison", "location", "prix", "rabat"]
    if any(word in text for word in blocked):
        return False

    return True

# ======================
# WIKIPEDIA AMÉLIORÉ
# ======================
def search_wikipedia(query):
    try:
        summary = wikipedia.summary(query, sentences=2)
        page = wikipedia.page(query)

        response = (
            f"📚 Voici ce que j’ai trouvé sur *{query}* :\n\n"
            f"{summary}\n\n"
        )

        return response

    except wikipedia.exceptions.DisambiguationError as e:
        suggestions = ", ".join(e.options[:3])
        return f"🤔 Question ambiguë.\n👉 Essayez : {suggestions}"

    except wikipedia.exceptions.PageError:
        return None

    except Exception as e:
        print("Erreur Wikipedia:", e)
        return None

# ======================
# ROUTES
# ======================
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        user_input = data.get("text", "").strip().lower()
        current_time = time.time()

        if user_input == "":
            return jsonify({"response": "Veuillez écrire un message."})

        # ======================
        # MEMOIRE
        # ======================
        if user_input in user_memory:
            old_response, last_time = user_memory[user_input]
            if current_time - last_time < 60:
                return jsonify({"response": old_response, "score": "memoire"})

        # ======================
        # 1️⃣ PATTERN
        # ======================
        response = search_in_patterns(user_input)
        if response:
            user_memory[user_input] = (response, current_time)
            return jsonify({"response": response, "score": "pattern"})

        # ======================
        # 2️⃣ ML
        # ======================
        response, score = predict_intent(user_input)

        # ======================
        # 3️⃣ WIKIPEDIA
        # ======================
        if (score < 10 or response is None) and is_good_wiki_query(user_input):

            keywords = " ".join(user_input.split()[:3])
            wiki_response = search_wikipedia(keywords)

            if wiki_response:
                return jsonify({
                    "response": wiki_response,
                    "source": "wikipedia",
                    "score": 50
                })

        # ======================
        # 4️⃣ FALLBACK
        # ======================
        with open("historique_questions.txt", "a", encoding="utf-8") as f:
            f.write(f"Question: {user_input}\n")  


        response = random.choice(fallback_responses)

        return jsonify({"response": response, "score": 0})

    except Exception as e:
        print("❌ Erreur serveur :", e)
        return jsonify({"response": "Erreur serveur."})

# ======================
# AUTRES ROUTES
# ======================
@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/register")
def register():
    return render_template("register.html")

@app.route("/parametre")
def parametre():
    return render_template("parametre.html")

@app.route("/key")
def key():
    return render_template("key.html")

@app.route("/api_key")
def apikey():
    return render_template("api_keys.html")

@app.route("/index")
def index():
    return render_template("index.html")

@app.route('/trainer')
def trainer():
    return render_template('trainer.html')

@app.route("/DATA")
def datas():
    return render_template("Data.html")
# ======================
# RUN
# ======================
if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=8006)