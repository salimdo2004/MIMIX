import json

# Charger le fichier JSON
def load_data(filename):
    with open(filename, "r", encoding="utf-8") as f:
        return json.load(f)

# Sauvegarder le fichier JSON
def save_data(filename, data):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

# Afficher les statistiques
def show_stats(data):
    intents = data["intents"]
    print("\n📊 STATISTIQUES")
    print(f"Nombre d'intents : {len(intents)}")

    for i, intent in enumerate(intents):
        print(f"\n🔹 Intent {i+1} : {intent['intent']}")
        print(f"   ➤ Questions : {len(intent['questions'])}")
        print(f"   ➤ Réponses : {len(intent['responses'])}")

# Ajouter une question
def add_question(data):
    intent_name = input("Nom de l'intent : ")

    for intent in data["intents"]:
        if intent["intent"] == intent_name:
            question = input("Nouvelle question : ")
            intent["questions"].append(question)
            print("✅ Question ajoutée !")
            return
    
    print("❌ Intent non trouvé")

# Ajouter une réponse
def add_response(data):
    intent_name = input("Nom de l'intent : ")

    for intent in data["intents"]:
        if intent["intent"] == intent_name:
            response = input("Nouvelle réponse : ")
            intent["responses"].append(response)
            print("✅ Réponse ajoutée !")
            return
    
    print("❌ Intent non trouvé")

# Modifier une intention
def modify_intent(data):
    old_name = input("Nom actuel de l'intent : ")
    
    for intent in data["intents"]:
        if intent["intent"] == old_name:
            new_name = input("Nouveau nom : ")
            intent["intent"] = new_name
            print("✅ Intent modifié !")
            return
    
    print("❌ Intent non trouvé")

# Menu principal
def main():
    filename = "data.json"
    data = load_data(filename)

    while True:
        print("\n===== MENU =====")
        print("1. Afficher statistiques")
        print("2. Ajouter une question")
        print("3. Ajouter une réponse")
        print("4. Modifier une intention")
        print("5. Sauvegarder")
        print("0. Quitter")

        choice = input("Choix : ")

        if choice == "1":
            show_stats(data)
        elif choice == "2":
            add_question(data)
        elif choice == "3":
            add_response(data)
        elif choice == "4":
            modify_intent(data)
        elif choice == "5":
            save_data(filename, data)
            print("💾 Données sauvegardées !")
        elif choice == "0":
            print("👋 Bye !")
            break
        else:
            print("❌ Choix invalide")

if __name__ == "__main__":
    main()