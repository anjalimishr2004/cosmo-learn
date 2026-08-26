// js/chat.js — "Ask the Scientist" slide-over chat

let chatHistory = [];
let activeTopicContext = null;

function setChatContext(topicData) {
  activeTopicContext = topicData;
  chatHistory = [];
  const messages = document.getElementById("chatMessages");
  messages.innerHTML = `<div class="chat-msg chat-msg--bot">Ask me anything about "${topicData.title}".</div>`;
}

function initChat() {
  const fab = document.getElementById("chatFab");
  const drawer = document.getElementById("chatDrawer");
  const closeBtn = document.getElementById("chatClose");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");

  fab.addEventListener("click", () => drawer.classList.add("open"));
  closeBtn.addEventListener("click", () => drawer.classList.remove("open"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    if (!activeTopicContext) {
      appendChatMessage("bot", "Pick a topic first, then I can answer questions about it.");
      return;
    }

    appendChatMessage("user", question);
    input.value = "";

    const typingId = appendChatMessage("bot", "Thinking...");

    try {
      const answer = await askScientist(activeTopicContext, chatHistory, question);
      chatHistory.push({ role: "user", parts: [{ text: question }] });
      chatHistory.push({ role: "model", parts: [{ text: answer }] });
      updateChatMessage(typingId, answer);
    } catch (err) {
      const message = err.message === "NO_API_KEY"
        ? "Please connect your API key first."
        : "Couldn't reach the AI right now — try again in a moment.";
      updateChatMessage(typingId, message);
    }
  });
}

function appendChatMessage(sender, text) {
  const messages = document.getElementById("chatMessages");
  const msg = document.createElement("div");
  const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  msg.id = id;
  msg.className = `chat-msg chat-msg--${sender}`;
  msg.textContent = text;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
  return id;
}

function updateChatMessage(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
