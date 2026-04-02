let chats = {};
let currentChatId = null;
let chatCount = 0;
let isLoggedIn = false;
let messageCount = 0;

/* ========================= */
/* INITIALISATION */
/* ========================= */
window.addEventListener("DOMContentLoaded", function () {

    const token = localStorage.getItem("token");

    if (token) {
        isLoggedIn = true;
    } else {
        isLoggedIn = false;
    }

    // Theme
    let savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    }

    updateAuthButton();
    updateThemeButton();

    // ✅ ENTER SEND MESSAGE
    const input = document.getElementById("message-input");

    input.addEventListener("keydown", function (event) {

        // Enter = envoyer
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }

        // Shift + Enter = nouvelle ligne
    });

});

/* ========================= */
/* MENU */
/* ========================= */
function toggleMenu() {
    document.getElementById("dropdown-menu").classList.toggle("show");
}

/* ========================= */
/* CHAT SYSTEM */
/* ========================= */
function newChat() {
    chatCount++;
    let chatId = "chat_" + chatCount;
    chats[chatId] = [];

    let chatItem = document.createElement("div");
    chatItem.className = "chat-item";
    chatItem.innerText = "Chat " + chatCount;
    chatItem.dataset.id = chatId;

    chatItem.onclick = () => loadChat(chatId);
    chatItem.ondblclick = () => enableRename(chatItem);

    document.getElementById("chat-list").prepend(chatItem);
    loadChat(chatId);
}

function loadChat(chatId) {
    currentChatId = chatId;
    let chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = "";

    chats[chatId].forEach(msg => {
        addMessageToUI(msg.text, msg.sender);
    });
}

function sendMessage() {

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

    // USER MESSAGE
    chats[currentChatId].push({ text: message, sender: "user" });
    addMessageToUI(message, "user");

    input.value = "";
    messageCount++;

    // BOT LOADING
    let loadingMsg = addMessageToUI("...", "bot");

    fetch("http://localhost:8006/predict", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: message })
    })
    .then(response => response.json())
    .then(data => {

        let botReply = data.response;

        // remplacer "..."
        loadingMsg.innerText = botReply;

        chats[currentChatId].push({ text: botReply, sender: "bot" });

    })
    .catch(error => {
        console.error("Erreur :", error);

        loadingMsg.innerText = "Erreur serveur ⚠️";

        chats[currentChatId].push({ text: "Erreur serveur ⚠️", sender: "bot" });
    });
}

/* ========================= */
/* UI MESSAGE */
/* ========================= */
function addMessageToUI(text, sender) {
    let msg = document.createElement("div");
    msg.classList.add("message", sender);
    msg.innerText = text;

    document.getElementById("chat-box").appendChild(msg);

    // auto scroll
    msg.scrollIntoView();

    return msg;
}

/* ========================= */
/* SEARCH CHAT */
/* ========================= */
function searchChats(keyword) {
    document.querySelectorAll(".chat-item").forEach(item => {
        item.style.display =
            item.innerText.toLowerCase().includes(keyword.toLowerCase())
            ? "block"
            : "none";
    });
}

/* ========================= */
/* AUTH */
/* ========================= */
function handleAuth() {
    if (isLoggedIn) {
        logout();
    } else {
        window.location.href = "/login";
    }
}

function logout() {
    localStorage.removeItem("token");
    isLoggedIn = false;

    alert("Déconnecté ❌");
    window.location.href = "/login";
}

function updateAuthButton() {
    let authBtn = document.getElementById("auth-btn");

    authBtn.innerText = isLoggedIn
        ? "Déconnexion"
        : "Se connecter";
}

/* ========================= */
/* THEME */
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

    themeBtn.innerText = document.body.classList.contains("light-mode")
        ? "🌙 Mode Nuit"
        : "☀️ Mode Jour";
}

/* ========================= */
/* SETTINGS */
/* ========================= */
function settings() {
    window.location.href = "/parametre";
}

/* ========================= */
/* RENAME CHAT */
/* ========================= */
function enableRename(chatItem) {

    let currentName = chatItem.innerText;

    let input = document.createElement("input");
    input.type = "text";
    input.value = currentName;
    input.className = "rename-input";

    chatItem.innerHTML = "";
    chatItem.appendChild(input);
    input.focus();

    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            finishRename(chatItem, input.value);
        }
    });

    input.addEventListener("blur", function () {
        finishRename(chatItem, input.value);
    });
}

function finishRename(chatItem, newName) {

    if (newName.trim() === "") {
        newName = "Chat";
    }

    chatItem.innerHTML = newName;

    let chatId = chatItem.dataset.id;
    chatItem.onclick = () => loadChat(chatId);
    chatItem.ondblclick = () => enableRename(chatItem);
}

