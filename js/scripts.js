let chats = {};
let currentChatId = null;
let chatCount = 0;
let isLoggedIn = false;
let messageCount = 0;

function toggleMenu() {
    document.getElementById("dropdown-menu").classList.toggle("show");
}

function newChat() {
    chatCount++;
    let chatId = "chat_" + chatCount;
    chats[chatId] = [];

    let chatItem = document.createElement("div");
    chatItem.className = "chat-item";
    chatItem.innerText = "Chat " + chatCount;
    chatItem.dataset.id = chatId;

    // 🔹 Charger le chat au clic
    chatItem.onclick = () => loadChat(chatId);

    // 🔹 Modifier le nom au double clic
    chatItem.ondblclick = function () {
        enableRename(chatItem);
    };

    document.getElementById("chat-list").prepend(chatItem);
    loadChat(chatId);
}

function loadChat(chatId) {
    currentChatId = chatId;
    let chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = "";
    chats[chatId].forEach(msg => addMessageToUI(msg.text, msg.sender));
}
function sendMessage() {

    // 🔹 Si aucun chat sélectionné → créer automatiquement un nouveau
    if (!currentChatId) {
        newChat();
    }

    if (!isLoggedIn && messageCount >= 3) {
        document.getElementById("login-bar").style.display = "block";
        return;
    }

    let input = document.getElementById("message-input");
    let message = input.value.trim();
    if (message === "") return;

    chats[currentChatId].push({text: message, sender: "user"});
    addMessageToUI(message, "user");
    input.value = "";
    messageCount++;

    setTimeout(() => {
        let botReply = "Réponse du bot";
        chats[currentChatId].push({text: botReply, sender: "bot"});
        addMessageToUI(botReply, "bot");
    }, 500);
}

function addMessageToUI(text, sender) {
    let msg = document.createElement("div");
    msg.classList.add("message", sender);
    msg.innerText = text;
    document.getElementById("chat-box").appendChild(msg);
}

function searchChats(keyword) {
    document.querySelectorAll(".chat-item").forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(keyword.toLowerCase()) ? "block" : "none";
    });
}


/* ========================= */
/* INITIALISATION AU CHARGEMENT */
/* ========================= */
window.onload = function () {

  const token = localStorage.getItem("token");

if (token) {
    isLoggedIn = true;
} else {
    isLoggedIn = false;
}

    // Vérifier thème
    let savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    }

    updateAuthButton();
    updateThemeButton();
};

/* ========================= */
/* MENU TOGGLE */
/* ========================= */
function toggleMenu() {
    document.getElementById("dropdown-menu").classList.toggle("show");
}

/* ========================= */
/* AUTHENTIFICATION SAFE */
/* ========================= */
function handleAuth() {
    if (isLoggedIn) {
        logout();
    } else {
        window.location.href = "login.html";
    }
}


function logout() {
    localStorage.removeItem("token"); // 🔥 IMPORTANT
    isLoggedIn = false;

    alert("Déconnecté ❌");

    window.location.href = "login.html"; // redirection
}   

function updateAuthButton() {
    let authBtn = document.getElementById("auth-btn");

    if (isLoggedIn) {
        authBtn.innerText = "🚪 Déconnexion";
    } else {
        authBtn.innerText = "🔐 Se connecter";
    }
}

/* ========================= */
/* THEME SYSTEM PRO */
/* ========================= */
function toggleTheme() {

    document.body.classList.toggle("light-mode");

    if (document.body.classList.contains("light-mode")) {
        localStorage.setItem("theme", "light");
    } else {
        localStorage.setItem("theme", "dark");
    }

    updateThemeButton();
}

function updateThemeButton() {
    let themeBtn = document.getElementById("theme-btn");

    if (document.body.classList.contains("light-mode")) {
        themeBtn.innerText = "🌙 Mode Nuit";
    } else {
        themeBtn.innerText = "☀️ Mode Jour";
    }
}

/* ========================= */
/* SETTINGS */
/* ========================= */
function settings() {
    window.location.href = "parametre.html";
}


document.getElementById("message-input").addEventListener("keydown", function(event) {

    // 🔹 Entrée
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }

    // 🔹 Espace (Space)
    if (event.code === "Space") {
        event.preventDefault();
        sendMessage();
    }

});


function enableRename(chatItem) {

    let currentName = chatItem.innerText;

    let input = document.createElement("input");
    input.type = "text";
    input.value = currentName;
    input.className = "rename-input";

    chatItem.innerHTML = "";
    chatItem.appendChild(input);
    input.focus();

    // Sauvegarder quand on appuie sur Entrée
    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            finishRename(chatItem, input.value);
        }
    });

    // Sauvegarder quand on clique ailleurs
    input.addEventListener("blur", function () {
        finishRename(chatItem, input.value);
    });
}

function finishRename(chatItem, newName) {

    if (newName.trim() === "") {
        newName = "Chat";
    }

    chatItem.innerHTML = newName;

    // Re-ajouter les events
    let chatId = chatItem.dataset.id;
    chatItem.onclick = () => loadChat(chatId);
    chatItem.ondblclick = function () {
        enableRename(chatItem);
    };
}

const token = localStorage.getItem("token");

if(!token){
  window.location.href = "login.html";
}