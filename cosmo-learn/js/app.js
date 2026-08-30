// js/app.js
// Main application logic

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initTabs();
  initChat();
  initTopicCards();
});


// ======================================================
// THEME TOGGLE
// ======================================================

function initTheme() {
  const toggle = document.getElementById("themeToggle");
  const root = document.documentElement;

  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const current = root.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";

    root.setAttribute("data-theme", next);

    toggle.innerHTML =
      next === "dark"
        ? '<i class="fa-solid fa-moon"></i>'
        : '<i class="fa-solid fa-sun"></i>';
  });
}


// ======================================================
// TABS
// ======================================================

function initTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  buttons.forEach(button => {
    button.addEventListener("click", () => {

      const tabName = button.dataset.tab;

      // Remove active from all buttons
      buttons.forEach(btn => {
        btn.classList.remove("active");
      });

      // Hide all panels
      panels.forEach(panel => {
        panel.classList.add("hidden");
      });

      // Activate clicked button
      button.classList.add("active");

      // Show selected panel
      const selectedPanel =
        document.getElementById(`panel-${tabName}`);

      if (selectedPanel) {
        selectedPanel.classList.remove("hidden");
      }
    });
  });
}


// ======================================================
// TOPIC CARDS
// ======================================================

function initTopicCards() {

  const cards = document.querySelectorAll(".topic-card");

  cards.forEach(card => {

    card.addEventListener("click", () => {
      handleTopicClick(card);
    });

  });
}


// ======================================================
// HANDLE TOPIC CLICK
// ======================================================

async function handleTopicClick(card) {

  const topicKey = card.dataset.topic;

  const topicName =
    card.querySelector(".topic-name")?.textContent?.trim();

  if (!topicName) {
    console.error("Topic name not found.");
    return;
  }


  // ----------------------------------------------------
  // Active card
  // ----------------------------------------------------

  document.querySelectorAll(".topic-card").forEach(c => {
    c.classList.remove("active");
  });

  card.classList.add("active");


  // ----------------------------------------------------
  // Check cache
  // ----------------------------------------------------

  const cached = CosmoCache.get(topicKey);

  if (cached) {

    renderTopicArticle(topicKey, cached);

    setChatContext(cached);

    return;
  }


  // ----------------------------------------------------
  // Loading
  // ----------------------------------------------------

  showSkeleton();


  try {

    console.log("Generating topic:", topicName);

    // Backend API call
    const data = await fetchScienceTopic(topicName);

    console.log("Topic received:", data);


    // Save to cache
    CosmoCache.set(topicKey, data);


    // Render content
    renderTopicArticle(topicKey, data);


    // Set chat context
    setChatContext(data);

  } catch (error) {

    console.error("Topic generation failed:", error);

    handleFetchError(error, topicKey);
  }
}


// ======================================================
// ERROR HANDLING
// ======================================================

function handleFetchError(error, topicKey) {

  const errorCode = error?.message || "UNKNOWN_ERROR";

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
      "The AI returned an empty response. Please try again."
  };


  const message =
    messages[errorCode] ||
    "Something went wrong. Showing sample content instead.";


  showError(message);


  // ----------------------------------------------------
  // Fallback content
  // ----------------------------------------------------

  if (typeof FALLBACK_TOPIC !== "undefined") {

    renderTopicArticle(
      topicKey,
      FALLBACK_TOPIC
    );

    setChatContext(FALLBACK_TOPIC);
  }
}
