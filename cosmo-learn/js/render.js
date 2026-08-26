// js/render.js
// Renders AI-generated science content into the website


// ======================================================
// CATALOG NUMBERS
// ======================================================

const CATALOG_NUMBERS = {
  astrophysics: "CAT.01",
  quantum: "CAT.02",
  biology: "CAT.03",
  energy: "CAT.04"
};


// ======================================================
// RENDER TOPIC ARTICLE
// ======================================================

function renderTopicArticle(topicKey, data) {

  // Catalog
  const catalog =
    document.getElementById("articleCatalog");

  if (catalog) {
    catalog.textContent =
      CATALOG_NUMBERS[topicKey] || "CAT.00";
  }


  // Title
  const title =
    document.getElementById("articleTitle");

  if (title) {
    title.textContent =
      data.title || "Science Topic";
  }


  // Summary
  const summary =
    document.getElementById("articleSummary");

  if (summary) {
    summary.textContent =
      data.summary || "";
  }


  // ====================================================
  // CORE MECHANICS
  // ====================================================

  const list =
    document.getElementById("mechanicsList");

  if (list) {

    list.innerHTML = "";

    const mechanics =
      Array.isArray(data.keyMechanics)
        ? data.keyMechanics
        : [];

    mechanics.forEach(point => {

      const li =
        document.createElement("li");

      li.textContent = point;

      list.appendChild(li);
    });
  }


  // ====================================================
  // EQUATION
  // ====================================================

  renderFormula(
    data.latexFormula,
    data.formulaExplanation
  );


  // ====================================================
  // REAL WORLD IMPACT
  // ====================================================

  const realWorld =
    document.getElementById("realWorldText");

  if (realWorld) {

    realWorld.textContent =
      data.realWorldApplication || "";
  }


  // ====================================================
  // QUIZ
  // ====================================================

  if (typeof renderQuiz === "function") {

    renderQuiz(
      Array.isArray(data.quiz)
        ? data.quiz
        : []
    );
  }


  // ====================================================
  // SHOW ARTICLE
  // ====================================================

  const article =
    document.getElementById("topicArticle");

  const skeleton =
    document.getElementById("skeletonState");

  const emptyState =
    document.querySelector(".empty-state");


  if (article) {
    article.classList.remove("hidden");
  }

  if (skeleton) {
    skeleton.classList.add("hidden");
  }

  if (emptyState) {
    emptyState.classList.add("hidden");
  }
}


// ======================================================
// EQUATION RENDERING
// ======================================================

function renderFormula(
  latexString,
  explanation
) {

  const target =
    document.getElementById("latexTarget");

  const explanationTarget =
    document.getElementById("formulaExplanation");


  if (!target) {
    return;
  }


  // Explanation
  if (explanationTarget) {

    explanationTarget.textContent =
      explanation || "";
  }


  // No formula
  if (!latexString) {

    target.textContent =
      "No equation available.";

    return;
  }


  // Convert to string
  let formula =
    String(latexString).trim();


  // ====================================================
  // CLEAN GEMINI LATEX
  // ====================================================

  // Remove Markdown code blocks
  formula = formula
    .replace(/^```latex\s*/i, "")
    .replace(/^```tex\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();


  // Remove \( ... \)
  if (
    formula.startsWith("\\(") &&
    formula.endsWith("\\)")
  ) {

    formula =
      formula.slice(2, -2).trim();
  }


  // Remove \[ ... \]
  if (
    formula.startsWith("\\[") &&
    formula.endsWith("\\]")
  ) {

    formula =
      formula.slice(2, -2).trim();
  }


  // Remove $$ ... $$
  if (
    formula.startsWith("$$") &&
    formula.endsWith("$$")
  ) {

    formula =
      formula.slice(2, -2).trim();
  }


  // Remove single $ ... $
  if (
    formula.startsWith("$") &&
    formula.endsWith("$")
  ) {

    formula =
      formula.slice(1, -1).trim();
  }


  // ====================================================
  // RENDER WITH KATEX
  // ====================================================

  try {

    if (
      typeof katex === "undefined"
    ) {

      throw new Error(
        "KaTeX library is not loaded."
      );
    }


    katex.render(
      formula,
      target,
      {
        throwOnError: false,
        displayMode: true,
        strict: false
      }
    );


  } catch (error) {

    console.error(
      "Equation rendering error:",
      error
    );


    // Fallback
    target.textContent =
      formula;
  }
}


// ======================================================
// LOADING SKELETON
// ======================================================

function showSkeleton() {

  const emptyState =
    document.querySelector(".empty-state");

  const article =
    document.getElementById("topicArticle");

  const skeleton =
    document.getElementById("skeletonState");


  if (emptyState) {
    emptyState.classList.add("hidden");
  }

  if (article) {
    article.classList.add("hidden");
  }

  if (skeleton) {
    skeleton.classList.remove("hidden");
  }
}


// ======================================================
// ERROR TOAST
// ======================================================

function showError(message) {

  const toast =
    document.getElementById("errorToast");

  const toastMessage =
    document.getElementById("toastMessage");

  if (!toast) {
    return;
  }


  if (toastMessage) {

    toastMessage.textContent =
      message;
  }


  toast.classList.remove("hidden");


  setTimeout(() => {

    toast.classList.add("hidden");

  }, 5000);
}