"use strict";

document.addEventListener("DOMContentLoaded", function () {
  initTheme();
  initTabs();
  initChat();
  initTopicCards();
});

function initTheme() {
  const toggle = document.getElementById("themeToggle");
  const root = document.documentElement;

  if (!toggle) return;

  toggle.addEventListener("click", function () {
    const current = root.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";

    root.setAttribute("data-theme", next);

    toggle.innerHTML =
      next === "dark"
        ? '<i class="fa-solid fa-moon"></i>'
        : '<i class="fa-solid fa-sun"></i>';
  });
}

function initTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      const tabName = button.dataset.tab;

      buttons.forEach(function (btn) {
        btn.classList.remove("active");
      });

      panels.forEach(function (panel) {
        panel.classList.add("hidden");
      });

      button.classList.add("active");

      const selectedPanel = document.getElementById(
        "panel-" + tabName
      );

      if (selectedPanel) {
        selectedPanel.classList.remove("hidden");
      }
    });
  });
}

function initTopicCards() {
  const cards = document.querySelectorAll(".topic-card");

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      handleTopicClick(card);
    });
  });
}

async function handleTopicClick(card) {
  const topicKey = card.dataset.topic;
  const topicNameElement = card.querySelector(".topic-name");

  if (!topicNameElement) {
    console.error("Topic name not found.");
    return;
  }

  const topicName = topicNameElement.textContent.trim();

  document.querySelectorAll(".topic-card").forEach(function (c) {
    c.classList.remove("active");
  });

  card.classList.add("active");

  if (
    typeof CosmoCache !== "undefined" &&
    typeof CosmoCache.get === "function"
  ) {
    const cached = CosmoCache.get(topicKey);

    if (cached) {
      renderTopicArticle(topicKey, cached);
      setChatContext(cached);
      return;
    }
  }

  if (typeof showSkeleton === "function") {
    showSkeleton();
  }

  try {
    console.log("Generating topic:", topicName);

    const data = await fetchScienceTopic(topicName);

    console.log("Topic received:", data);

    if (
      typeof CosmoCache !== "undefined" &&
      typeof CosmoCache.set === "function"
    ) {
      CosmoCache.set(topicKey, data);
    }

    renderTopicArticle(topicKey, data);
    setChatContext(data);

  } catch (error) {
    console.error("Topic generation failed:", error);
    handleFetchError(error, topicKey);
  }
}

function handleFetchError(error, topicKey) {
  const errorCode = error && error.message
    ? error.message
    : "UNKNOWN_ERROR";

  console.error("Error code:", errorCode);

  const messages = {
    QUOTA_EXCEEDED:
      "API quota limit reached. Please try again later.",

    BAD_API_KEY:
      "The Gemini API key configured on the server is invalid.",

    GEMINI_MODEL_NOT_FOUND:
      "The Gemini model is not available.",

    GEMINI_ERROR:
      "Gemini returned an error. Please try again.",

    NETWORK_ERROR:
      "Network error. Please check your connection.",

    EMPTY_RESPONSE:
      "The AI returned an empty response. Please try again.",

    EMPTY_AI_RESPONSE:
      "The AI returned an empty response. Please try again."
  };

  const message =
    messages[errorCode] ||
    "Something went wrong. Showing sample content instead.";

  if (typeof showError === "function") {
    showError(message);
  }

  if (typeof FALLBACK_TOPIC !== "undefined") {
    renderTopicArticle(topicKey, FALLBACK_TOPIC);
    setChatContext(FALLBACK_TOPIC);
  }
}