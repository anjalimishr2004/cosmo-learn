// js/quiz.js — self-contained quiz rendering + grading

let quizState = { questions: [], selected: [], submitted: false };

function renderQuiz(questions) {
  quizState = { questions, selected: new Array(questions.length).fill(null), submitted: false };

  const container = document.getElementById("quizContainer");
  container.innerHTML = "";

  questions.forEach((q, qIndex) => {
    const block = document.createElement("div");
    block.className = "quiz-question";

    const heading = document.createElement("h4");
    heading.textContent = `${qIndex + 1}. ${q.question}`;
    block.appendChild(heading);

    q.options.forEach((optionText, optIndex) => {
      const optBtn = document.createElement("button");
      optBtn.type = "button";
      optBtn.className = "quiz-option";
      optBtn.textContent = optionText;
      optBtn.addEventListener("click", () => selectAnswer(qIndex, optIndex));
      block.appendChild(optBtn);
    });

    const explanation = document.createElement("div");
    explanation.className = "quiz-explanation hidden";
    explanation.textContent = q.explanation;
    explanation.id = `explanation-${qIndex}`;
    block.appendChild(explanation);

    container.appendChild(block);
  });

  const submitBtn = document.createElement("button");
  submitBtn.className = "btn-primary";
  submitBtn.textContent = "Submit Quiz";
  submitBtn.id = "quizSubmitBtn";
  submitBtn.addEventListener("click", submitQuiz);
  container.appendChild(submitBtn);
}

function selectAnswer(qIndex, optIndex) {
  if (quizState.submitted) return;
  quizState.selected[qIndex] = optIndex;

  const block = document.querySelectorAll(".quiz-question")[qIndex];
  block.querySelectorAll(".quiz-option").forEach((btn, i) => {
    btn.classList.toggle("selected", i === optIndex);
  });
}

function submitQuiz() {
  quizState.submitted = true;
  let score = 0;

  quizState.questions.forEach((q, qIndex) => {
    const block = document.querySelectorAll(".quiz-question")[qIndex];
    const options = block.querySelectorAll(".quiz-option");
    const userAnswer = quizState.selected[qIndex];

    options.forEach((btn, optIndex) => {
      btn.disabled = true;
      if (optIndex === q.correctIndex) btn.classList.add("correct");
      else if (optIndex === userAnswer) btn.classList.add("incorrect");
    });

    if (userAnswer === q.correctIndex) score++;
    document.getElementById(`explanation-${qIndex}`).classList.remove("hidden");
  });

  const submitBtn = document.getElementById("quizSubmitBtn");
  submitBtn.remove();

  const scoreEl = document.createElement("div");
  scoreEl.className = "quiz-score";
  scoreEl.textContent = `Score: ${score} / ${quizState.questions.length}`;
  document.getElementById("quizContainer").appendChild(scoreEl);
}
