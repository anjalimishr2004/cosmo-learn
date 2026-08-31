
// ======================================================
// COSMOLEARN — ASK THE SCIENTIST CHAT
// ======================================================

"use strict";

// ======================================================
// SCIENTIST IMAGE PATHS
// IMPORTANT: Your working Vercel URL uses /public/
// ======================================================

const SCIENTIST_CLOSED = "/scientist-closed.png";
const SCIENTIST_OPEN = "/scientist-open.png";

// ======================================================
// CHAT STATE
// ======================================================

window.cosmoLearnChatState =
  window.cosmoLearnChatState || {
    chatHistory: [],
    speechEnabled: true,
    currentSpeech: null,
    mouthAnimationTimer: null,
    activeTopicContext: null,
    initialized: false
  };

// ======================================================
// SET CHAT CONTEXT
// ======================================================

function setChatContext(topicData) {
  if (!topicData) {
    console.warn("setChatContext: topicData is missing.");
    return;
  }

  window.cosmoLearnChatState.activeTopicContext = topicData;
  window.cosmoLearnChatState.chatHistory = [];

  const messages = document.getElementById("chatMessages");

  if (messages) {
    const title = topicData.title || "this topic";

    messages.innerHTML = "";

    const welcome = document.createElement("div");

    welcome.className = "chat-msg chat-msg--bot";

    welcome.textContent =
      `Ask me anything about "${title}".`;

    messages.appendChild(welcome);
  }
}

// ======================================================
// GET SCIENTIST IMAGE
// ======================================================

function getScientistImage() {
  return document.getElementById("scientistAvatarImage");
}

// ======================================================
// MAKE IMAGE VISIBLE
// ======================================================

function makeScientistVisible() {
  const avatar = getScientistImage();

  if (!avatar) {
    console.warn("scientistAvatarImage not found.");
    return;
  }

  avatar.style.display = "block";
  avatar.style.visibility = "visible";
  avatar.style.opacity = "1";
}

// ======================================================
// RESET SCIENTIST IMAGE
// ======================================================

function resetScientistImage() {
  const avatar = getScientistImage();

  if (!avatar) {
    console.warn("scientistAvatarImage not found.");
    return;
  }

  stopMouthAnimation();

  avatar.onerror = null;

  makeScientistVisible();

  // IMPORTANT:
  // Do NOT use /scientist-closed.png
  // Your working file is /public/scientist-closed.png

  avatar.src = SCIENTIST_CLOSED;
}

// ======================================================
// CLOSED MOUTH
// ======================================================

function setScientistClosed() {
  const avatar = getScientistImage();

  if (!avatar) {
    return;
  }

  makeScientistVisible();

  avatar.onerror = null;

  if (avatar.src !== window.location.origin + SCIENTIST_CLOSED) {
    avatar.src = SCIENTIST_CLOSED;
  }
}

// ======================================================
// OPEN MOUTH
// ======================================================

function setScientistOpen() {
  const avatar = getScientistImage();

  if (!avatar) {
    return;
  }

  makeScientistVisible();

  avatar.onerror = function () {
    console.warn(
      "Scientist open image failed. Returning to closed image."
    );

    avatar.onerror = null;
    avatar.src = SCIENTIST_CLOSED;
  };

  avatar.src = SCIENTIST_OPEN;
}

// ======================================================
// PRELOAD SCIENTIST IMAGES
// ======================================================

function preloadScientistImages() {
  const closedImage = new Image();

  closedImage.onload = () => {
    console.log(
      "Scientist closed image loaded:",
      SCIENTIST_CLOSED
    );
  };

  closedImage.onerror = () => {
    console.error(
      "Scientist closed image FAILED:",
      SCIENTIST_CLOSED
    );
  };

  closedImage.src = SCIENTIST_CLOSED;


  const openImage = new Image();

  openImage.onload = () => {
    console.log(
      "Scientist open image loaded:",
      SCIENTIST_OPEN
    );
  };

  openImage.onerror = () => {
    console.warn(
      "Scientist open image FAILED:",
      SCIENTIST_OPEN
    );
  };

  openImage.src = SCIENTIST_OPEN;
}

// ======================================================
// INIT CHAT
// ======================================================

function initChat() {

  // IMPORTANT:
  // Prevent duplicate initialization.
  if (window.cosmoLearnChatState.initialized) {
    console.log("Chat already initialized.");
    return;
  }

  const navChat =
    document.getElementById("chatNav");

  const drawer =
    document.getElementById("chatDrawer");

  const closeBtn =
    document.getElementById("chatClose");

  const form =
    document.getElementById("chatForm");

  const input =
    document.getElementById("chatInput");


  if (!drawer) {
    console.warn("Chat drawer not found.");
    return;
  }


  // Mark initialized
  window.cosmoLearnChatState.initialized = true;


  // ==================================================
  // INITIAL IMAGE
  // ==================================================

  resetScientistImage();

  preloadScientistImages();


  // ==================================================
  // OPEN CHAT
  // ==================================================

  if (navChat) {

    navChat.addEventListener("click", () => {

      console.log("Opening Ask the Scientist...");

      // Stop any old speech/animation
      stopSpeaking();

      // Reset image BEFORE opening
      resetScientistImage();

      // Force image visibility
      makeScientistVisible();

      // Open drawer
      drawer.classList.add("open");

      // Force image visibility again after drawer opens
      requestAnimationFrame(() => {
        const avatar = getScientistImage();

        if (avatar) {
          avatar.style.display = "block";
          avatar.style.visibility = "visible";
          avatar.style.opacity = "1";

          // If image somehow lost its source
          if (!avatar.getAttribute("src")) {
            avatar.src = SCIENTIST_CLOSED;
          }
        }
      });

      // Focus input
      if (input) {
        setTimeout(() => {
          input.focus();
        }, 150);
      }
    });
  }


  // ==================================================
  // CLOSE CHAT
  // ==================================================

  if (closeBtn) {

    closeBtn.addEventListener("click", () => {

      console.log("Closing Ask the Scientist...");

      // Stop voice
      stopSpeaking();

      // Stop animation
      stopMouthAnimation();

      // Close drawer
      drawer.classList.remove("open");

      // Reset image
      resetScientistImage();
    });
  }


  // ==================================================
  // CHAT FORM
  // ==================================================

  if (form && input) {

    form.addEventListener("submit", async (e) => {

      e.preventDefault();

      const question = input.value.trim();

      if (!question) {
        return;
      }


      // ==================================================
      // CURRENT TOPIC
      // ==================================================

      const topicContext =
        window.cosmoLearnChatState.activeTopicContext;


      // ==================================================
      // NO TOPIC
      // ==================================================

      if (!topicContext) {

        appendChatMessage(
          "bot",
          "Pick a topic first, then I can answer questions about it."
        );

        return;
      }


      // ==================================================
      // STOP PREVIOUS SPEECH
      // ==================================================

      stopSpeaking();


      // ==================================================
      // SHOW USER MESSAGE
      // ==================================================

      appendChatMessage(
        "user",
        question
      );

      input.value = "";


      // ==================================================
      // THINKING
      // ==================================================

      const typingId =
        appendChatMessage(
          "bot",
          "Thinking..."
        );


      try {

        // ==================================================
        // ASK AI
        // ==================================================

        const answer =
          await askScientist(
            topicContext,
            window.cosmoLearnChatState.chatHistory,
            question
          );


        // ==================================================
        // VALIDATE ANSWER
        // ==================================================

        if (
          !answer ||
          typeof answer !== "string" ||
          !answer.trim()
        ) {
          throw new Error("EMPTY_AI_RESPONSE");
        }


        // ==================================================
        // SAVE USER MESSAGE
        // ==================================================

        window.cosmoLearnChatState.chatHistory.push({
          role: "user",
          parts: [
            {
              text: question
            }
          ]
        });


        // ==================================================
        // SAVE AI MESSAGE
        // ==================================================

        window.cosmoLearnChatState.chatHistory.push({
          role: "model",
          parts: [
            {
              text: answer
            }
          ]
        });


        // ==================================================
        // SHOW ANSWER
        // ==================================================

        updateChatMessage(
          typingId,
          answer
        );


        // ==================================================
        // SPEAK
        // ==================================================

        if (
          window.cosmoLearnChatState.speechEnabled
        ) {

          speakText(answer);

        } else {

          stopScientistAnimation();

        }

      } catch (err) {

        console.error("Chat error:", err);

        stopSpeaking();

        let message =
          "Couldn't reach the AI right now. Please try again.";


        if (
          err &&
          err.message === "EMPTY_AI_RESPONSE"
        ) {
          message =
            "The AI returned an empty response. Please try again.";
        }


        if (
          err &&
          err.message === "QUOTA_EXCEEDED"
        ) {
          message =
            "AI usage limit reached. Please try again later.";
        }


        if (
          err &&
          err.message === "BAD_API_KEY"
        ) {
          message =
            "There is a problem with the Gemini API key.";
        }


        if (
          err &&
          err.message === "GEMINI_MODEL_NOT_FOUND"
        ) {
          message =
            "The Gemini model is unavailable. Please check the server configuration.";
        }


        if (typingId) {
          updateChatMessage(
            typingId,
            message
          );
        }
      }
    });
  }


  // ==================================================
  // VOICE CONTROL
  // ==================================================

  addSpeechControl(drawer);
}

// ======================================================
// NATURAL LIP ANIMATION
// ======================================================

function startScientistAnimation() {

  const avatar = getScientistImage();

  if (!avatar) {
    return;
  }

  stopMouthAnimation();

  makeScientistVisible();

  setScientistClosed();

  let stopped = false;

  function animateMouth() {

    if (stopped) {
      return;
    }

    const open =
      Math.random() > 0.35;


    if (open) {
      setScientistOpen();
    } else {
      setScientistClosed();
    }


    const delay =
      open
        ? 70 + Math.random() * 100
        : 90 + Math.random() * 150;


    const timeoutId =
      setTimeout(
        animateMouth,
        delay
      );


    window.cosmoLearnChatState.mouthAnimationTimer = {
      cancel: () => {
        stopped = true;
        clearTimeout(timeoutId);
      }
    };
  }


  animateMouth();
}

// ======================================================
// STOP SCIENTIST ANIMATION
// ======================================================

function stopScientistAnimation() {

  stopMouthAnimation();

  setScientistClosed();
}

// ======================================================
// START MOUTH ANIMATION
// ======================================================

function startMouthAnimation() {
  startScientistAnimation();
}

// ======================================================
// STOP MOUTH ANIMATION
// ======================================================

function stopMouthAnimation() {

  const timer =
    window.cosmoLearnChatState.mouthAnimationTimer;

  if (!timer) {
    return;
  }


  if (
    typeof timer === "object" &&
    typeof timer.cancel === "function"
  ) {
    timer.cancel();
  }


  if (typeof timer === "number") {
    clearTimeout(timer);
    clearInterval(timer);
  }


  window.cosmoLearnChatState.mouthAnimationTimer =
    null;
}

// ======================================================
// SPEECH CONTROL
// ======================================================

function addSpeechControl(drawer) {

  if (
    document.getElementById("speechToggle")
  ) {
    return;
  }


  const button =
    document.createElement("button");


  button.id =
    "speechToggle";

  button.type =
    "button";

  button.title =
    "Toggle voice";

  button.setAttribute(
    "aria-label",
    "Toggle voice"
  );


  button.innerHTML =
    '<i class="fa-solid fa-volume-high"></i> Voice On';


  button.style.cssText = `
    position: absolute;
    top: 68px;
    right: 14px;
    z-index: 50;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    border-radius: 8px;
    padding: 7px 10px;
    cursor: pointer;
    font-size: 12px;
  `;


  button.addEventListener("click", () => {

    window.cosmoLearnChatState.speechEnabled =
      !window.cosmoLearnChatState.speechEnabled;


    if (
      !window.cosmoLearnChatState.speechEnabled
    ) {

      stopSpeaking();

      button.innerHTML =
        '<i class="fa-solid fa-volume-xmark"></i> Voice Off';

    } else {

      button.innerHTML =
        '<i class="fa-solid fa-volume-high"></i> Voice On';
    }
  });


  const position =
    window.getComputedStyle(drawer).position;


  if (position === "static") {
    drawer.style.position = "fixed";
  }


  drawer.appendChild(button);
}

// ======================================================
// TEXT TO SPEECH
// ======================================================

function speakText(text) {

  if (!("speechSynthesis" in window)) {

    console.warn(
      "Speech synthesis is not supported."
    );

    stopScientistAnimation();

    return;
  }


  window.speechSynthesis.cancel();

  stopScientistAnimation();


  const cleanText =
    cleanTextForSpeech(text);


  if (!cleanText) {

    stopScientistAnimation();

    return;
  }


  const utterance =
    new SpeechSynthesisUtterance(
      cleanText
    );


  utterance.lang = "en-US";
  utterance.rate = 0.95;
  utterance.pitch = 1.05;
  utterance.volume = 1;


  const voices =
    window.speechSynthesis.getVoices();


  const preferredVoice =
    voices.find(
      (voice) =>
        /en-US/i.test(voice.lang) &&
        /Samantha|Zira|Google US English|Natural|Jenny|Aria|female/i.test(
          voice.name
        )
    ) ||
    voices.find(
      (voice) =>
        /en-US/i.test(voice.lang)
    ) ||
    voices.find(
      (voice) =>
        /^en/i.test(voice.lang)
    );


  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }


  window.cosmoLearnChatState.currentSpeech =
    utterance;


  utterance.onstart = () => {

    if (
      window.cosmoLearnChatState.currentSpeech !==
      utterance
    ) {
      return;
    }

    startScientistAnimation();
  };


  utterance.onend = () => {

    if (
      window.cosmoLearnChatState.currentSpeech ===
      utterance
    ) {

      window.cosmoLearnChatState.currentSpeech =
        null;
    }

    stopScientistAnimation();
  };


  utterance.onerror = (event) => {

    console.warn(
      "Speech synthesis error:",
      event
    );


    if (
      window.cosmoLearnChatState.currentSpeech ===
      utterance
    ) {

      window.cosmoLearnChatState.currentSpeech =
        null;
    }


    stopScientistAnimation();
  };


  window.speechSynthesis.speak(
    utterance
  );


  setTimeout(() => {

    if (
      window.cosmoLearnChatState.currentSpeech ===
        utterance &&
      window.speechSynthesis.speaking
    ) {

      startScientistAnimation();
    }

  }, 150);
}

// ======================================================
// STOP SPEAKING
// ======================================================

function stopSpeaking() {

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }


  window.cosmoLearnChatState.currentSpeech =
    null;


  stopScientistAnimation();
}

// ======================================================
// CLEAN TEXT
// ======================================================

function cleanTextForSpeech(text) {

  if (!text) {
    return "";
  }


  return String(text)
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\n+/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

// ======================================================
// ADD CHAT MESSAGE
// ======================================================

function appendChatMessage(sender, text) {

  const messages =
    document.getElementById(
      "chatMessages"
    );


  if (!messages) {

    console.warn(
      "chatMessages element not found."
    );

    return null;
  }


  const msg =
    document.createElement("div");


  const id =
    `msg-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;


  msg.id = id;


  msg.className =
    `chat-msg chat-msg--${sender}`;


  msg.textContent = text;


  messages.appendChild(msg);


  messages.scrollTop =
    messages.scrollHeight;


  return id;
}

// ======================================================
// UPDATE CHAT MESSAGE
// ======================================================

function updateChatMessage(id, text) {

  if (!id) {
    return;
  }


  const el =
    document.getElementById(id);


  if (!el) {
    return;
  }


  el.textContent = text;


  const messages =
    document.getElementById(
      "chatMessages"
    );


  if (messages) {

    messages.scrollTop =
      messages.scrollHeight;
  }
}

// ======================================================
// LOAD VOICES
// ======================================================

if ("speechSynthesis" in window) {

  window.speechSynthesis.onvoiceschanged =
    () => {
      window.speechSynthesis.getVoices();
    };
}

// ======================================================
// IMPORTANT
// DO NOT AUTO-INIT HERE.
//
// app.js already calls initChat().
// Having another DOMContentLoaded listener here
// was causing duplicate chat event listeners.
// ======================================================
````
