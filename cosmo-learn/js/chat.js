
// js/chat.js
// Ask the Scientist
// AI chat + female voice + natural scientist lip animation

"use strict";


// ==================================================
// CHAT STATE
// ==================================================

window.cosmoLearnChatState =
  window.cosmoLearnChatState || {
    activeTopicContext: null,
    chatHistory: [],
    speechEnabled: true,
    currentSpeech: null,
    mouthAnimationTimer: null
  };


// ==================================================
// SET CHAT CONTEXT
// ==================================================

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


// ==================================================
// INIT CHAT
// ==================================================

function initChat() {
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


  // ==================================================
  // OPEN CHAT
  // ==================================================

  if (navChat) {
    navChat.addEventListener("click", () => {

      drawer.classList.add("open");

      if (input) {
        setTimeout(() => input.focus(), 100);
      }

    });
  }


  // ==================================================
  // CLOSE CHAT
  // ==================================================

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {

      drawer.classList.remove("open");

      stopSpeaking();

    });
  }


  // ==================================================
  // CHAT FORM
  // ==================================================

  if (form && input) {

    form.addEventListener("submit", async (e) => {

      e.preventDefault();


      const question =
        input.value.trim();


      if (!question) {
        return;
      }


      // ==================================================
      // GET CURRENT TOPIC
      // ==================================================

      const topicContext =
        window.cosmoLearnChatState.activeTopicContext;


      // ==================================================
      // NO TOPIC SELECTED
      // ==================================================

      if (!topicContext) {

        appendChatMessage(
          "bot",
          "Pick a topic first, then I can answer questions about it."
        );

        return;
      }


      // ==================================================
      // STOP ANY PREVIOUS SPEECH
      // ==================================================

      stopSpeaking();


      // ==================================================
      // SHOW USER QUESTION
      // ==================================================

      appendChatMessage(
        "user",
        question
      );

      input.value = "";


      // ==================================================
      // THINKING MESSAGE
      // ==================================================

      const typingId =
        appendChatMessage(
          "bot",
          "Thinking..."
        );


      // IMPORTANT:
      // Do NOT start lip animation here.
      // Lips will start only when actual speech begins.


      try {

        // ==================================================
        // ASK SCIENTIST
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

          throw new Error(
            "EMPTY_AI_RESPONSE"
          );

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
        // SPEAK ANSWER
        // ==================================================

        if (
          window.cosmoLearnChatState.speechEnabled
        ) {

          speakText(answer);

        } else {

          stopScientistAnimation();

        }


      } catch (err) {

        console.error(
          "Chat error:",
          err
        );


        stopSpeaking();


        let message =
          "Couldn't reach the AI right now. Please try again.";


        if (
          err &&
          err.message ===
            "EMPTY_AI_RESPONSE"
        ) {

          message =
            "The AI returned an empty response. Please try again.";

        }


        if (
          err &&
          err.message ===
            "QUOTA_EXCEEDED"
        ) {

          message =
            "AI usage limit reached. Please try again later.";

        }


        if (
          err &&
          err.message ===
            "BAD_API_KEY"
        ) {

          message =
            "There is a problem with the Gemini API key.";

        }


        if (
          err &&
          err.message ===
            "GEMINI_MODEL_NOT_FOUND"
        ) {

          message =
            "The Gemini model is unavailable. Please check server.js.";

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
  // VOICE BUTTON
  // ==================================================

  addSpeechControl(drawer);

}


// ==================================================
// NATURAL SCIENTIST LIP ANIMATION
// ==================================================

function startScientistAnimation() {

  const avatarImage =
    document.getElementById(
      "scientistAvatarImage"
    );


  if (!avatarImage) {

    console.warn(
      "scientistAvatarImage not found."
    );

    return;
  }


  // Stop previous animation
  stopMouthAnimation();


  // Always start with closed mouth
  avatarImage.src =
    "public/scientist-closed.png";


  let stopped = false;


  // ==================================================
  // NATURAL MOUTH LOOP
  // ==================================================

  const animateMouth = () => {

    if (stopped) {
      return;
    }


    // Random mouth state
    const shouldOpen =
      Math.random() > 0.38;


    avatarImage.src =
      shouldOpen
        ? "public/scientist-open.png"
        : "public/scientist-closed.png";


    // Different timing for open / closed
    // prevents robotic rhythm

    const nextDelay =
      shouldOpen
        ? 80 + Math.random() * 120
        : 110 + Math.random() * 190;


    window.cosmoLearnChatState.mouthAnimationTimer =
      setTimeout(
        animateMouth,
        nextDelay
      );

  };


  // Store cancel function
  window.cosmoLearnChatState.mouthAnimationTimer = {

    cancel: () => {
      stopped = true;
    }

  };


  // Start loop
  animateMouth();

}


// ==================================================
// STOP SCIENTIST ANIMATION
// ==================================================

function stopScientistAnimation() {

  const avatarImage =
    document.getElementById(
      "scientistAvatarImage"
    );


  stopMouthAnimation();


  if (avatarImage) {

    avatarImage.src =
      "public/scientist-closed.png";

  }

}


// ==================================================
// MOUTH ANIMATION COMPATIBILITY
// ==================================================

function startMouthAnimation() {

  startScientistAnimation();

}


// ==================================================
// STOP MOUTH ANIMATION
// ==================================================

function stopMouthAnimation() {

  const timer =
    window.cosmoLearnChatState
      .mouthAnimationTimer;


  if (!timer) {
    return;
  }


  // New timeout-based animation
  if (
    typeof timer === "object" &&
    typeof timer.cancel === "function"
  ) {

    timer.cancel();

  }


  // Old timer compatibility
  if (
    typeof timer === "number"
  ) {

    clearTimeout(timer);
    clearInterval(timer);

  }


  window.cosmoLearnChatState
    .mouthAnimationTimer = null;

}


// ==================================================
// SPEECH CONTROL
// ==================================================

function addSpeechControl(drawer) {

  if (
    document.getElementById(
      "speechToggle"
    )
  ) {

    return;

  }


  const button =
    document.createElement(
      "button"
    );


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


  // ==================================================
  // VOICE BUTTON POSITION
  // ==================================================

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


  // ==================================================
  // VOICE TOGGLE
  // ==================================================

  button.addEventListener(
    "click",
    () => {

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

    }
  );


  // ==================================================
  // MAKE DRAWER POSITIONED
  // ==================================================

  const position =
    window.getComputedStyle(
      drawer
    ).position;


  if (
    position === "static"
  ) {

    drawer.style.position =
      "fixed";

  }


  drawer.appendChild(button);

}


// ==================================================
// TEXT TO SPEECH
// ==================================================

function speakText(text) {

  if (
    !("speechSynthesis" in window)
  ) {

    console.warn(
      "Speech synthesis is not supported."
    );

    stopScientistAnimation();

    return;

  }


  // Stop any existing speech
  stopSpeaking();


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


  utterance.lang =
    "en-US";


  utterance.rate =
    0.95;


  utterance.pitch =
    1.08;


  utterance.volume =
    1;


  // ==================================================
  // SELECT FEMALE VOICE
  // ==================================================

  const voices =
    window.speechSynthesis.getVoices();


  const preferredVoice =
    voices.find(
      (voice) =>
        voice.lang === "en-US" &&
        /female|Samantha|Zira|Google US English|Natural/i.test(
          voice.name
        )
    ) ||
    voices.find(
      (voice) =>
        voice.lang === "en-US"
    );


  if (preferredVoice) {

    utterance.voice =
      preferredVoice;

  }


  // ==================================================
  // SAVE CURRENT SPEECH
  // ==================================================

  window.cosmoLearnChatState.currentSpeech =
    utterance;


  // ==================================================
  // SPEECH START
  // ==================================================
  // VERY IMPORTANT:
  // Lip movement starts ONLY after browser
  // confirms that speech has actually started.

  utterance.onstart = () => {

    if (
      window.cosmoLearnChatState.currentSpeech !==
      utterance
    ) {

      return;

    }


    startScientistAnimation();

  };


  // ==================================================
  // SPEECH BOUNDARY
  // ==================================================
  // Briefly close mouth between words/phrases
  // to make movement less robotic.

  utterance.onboundary = () => {

    if (
      window.cosmoLearnChatState.currentSpeech !==
      utterance
    ) {

      return;

    }

    // Animation continues naturally.
    // No hard reset here because that looks robotic.

  };


  // ==================================================
  // SPEECH FINISHED
  // ==================================================

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


  // ==================================================
  // SPEECH ERROR
  // ==================================================

  utterance.onerror = () => {

    if (
      window.cosmoLearnChatState.currentSpeech ===
      utterance
    ) {

      window.cosmoLearnChatState.currentSpeech =
        null;

    }


    stopScientistAnimation();

  };


  // ==================================================
  // SPEAK
  // ==================================================

  window.speechSynthesis.speak(
    utterance
  );

}


// ==================================================
// STOP SPEAKING
// ==================================================

function stopSpeaking() {

  if (
    "speechSynthesis" in window
  ) {

    window.speechSynthesis.cancel();

  }


  window.cosmoLearnChatState.currentSpeech =
    null;


  stopScientistAnimation();

}


// ==================================================
// CLEAN TEXT FOR SPEECH
// ==================================================

function cleanTextForSpeech(text) {

  if (!text) {
    return "";
  }


  return String(text)

    // Remove code blocks
    .replace(
      /```[\s\S]*?```/g,
      ""
    )

    // Remove inline code
    .replace(
      /`([^`]+)`/g,
      "$1"
    )

    // Remove markdown headings
    .replace(
      /^#{1,6}\s*/gm,
      ""
    )

    // Remove bold
    .replace(
      /\*\*([^*]+)\*\*/g,
      "$1"
    )

    // Remove italic
    .replace(
      /\*([^*]+)\*/g,
      "$1"
    )

    // Remove markdown links
    .replace(
      /\[([^\]]+)\]\([^)]+\)/g,
      "$1"
    )

    // Replace new lines with pauses
    .replace(
      /\n+/g,
      ". "
    )

    // Remove excessive spaces
    .replace(
      /\s+/g,
      " "
    )

    .trim();

}


// ==================================================
// ADD CHAT MESSAGE
// ==================================================

function appendChatMessage(
  sender,
  text
) {

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
    document.createElement(
      "div"
    );


  const id =
    `msg-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;


  msg.id =
    id;


  msg.className =
    `chat-msg chat-msg--${sender}`;


  msg.textContent =
    text;


  messages.appendChild(
    msg
  );


  messages.scrollTop =
    messages.scrollHeight;


  return id;

}


// ==================================================
// UPDATE CHAT MESSAGE
// ==================================================

function updateChatMessage(
  id,
  text
) {

  if (!id) {
    return;
  }


  const el =
    document.getElementById(
      id
    );


  if (!el) {
    return;
  }


  el.textContent =
    text;


  const messages =
    document.getElementById(
      "chatMessages"
    );


  if (messages) {

    messages.scrollTop =
      messages.scrollHeight;

  }

}


// ==================================================
// LOAD VOICES
// ==================================================

if (
  "speechSynthesis" in window
) {

  window.speechSynthesis.onvoiceschanged =
    () => {

      window.speechSynthesis.getVoices();

    };

}
````
