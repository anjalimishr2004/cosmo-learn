require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Website serve karo
app.use(express.static(path.join(__dirname)));

// ================================
// Gemini helper
// ================================

async function askGemini(contents, generationConfig = {}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in .env");
  }

  const model = "gemini-3.6-flash";

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents,
      generationConfig
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Gemini error:", data);
    throw new Error(data.error?.message || "Gemini API error");
  }

  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "No response generated."
  );
}


// ================================
// Topic API
// ================================

app.post("/api/topic", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({
        error: "Topic is required."
      });
    }

    const prompt = `
You are an expert scientific educator.

Create an interactive science module about:
"${topic}"

Return ONLY valid JSON.

Use exactly this structure:

{
  "title": "string",
  "category": "string",
  "summary": "string",
  "keyMechanics": ["string", "string", "string"],
  "latexFormula": "string",
  "formulaExplanation": "string",
  "realWorldApplication": "string",
  "quiz": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctIndex": 0,
      "explanation": "string"
    }
  ]
}

Rules:
- summary should be 2 sentences.
- keyMechanics should contain exactly 3 items.
- quiz should contain exactly 3 questions.
- every quiz question must have exactly 4 options.
- correctIndex must be 0, 1, 2, or 3.
- Make the science accurate and understandable.
`;

    const result = await askGemini(
      [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      {
        temperature: 0.4,
        responseMimeType: "application/json"
      }
    );

    let parsed;

    try {
      parsed = JSON.parse(result);
    } catch (error) {
      console.error("Gemini returned invalid JSON:", result);

      return res.status(500).json({
        error: "Gemini returned invalid JSON."
      });
    }

    res.json(parsed);

  } catch (error) {
    console.error("Topic API error:", error);

    res.status(500).json({
      error: error.message
    });
  }
});


// ================================
// Chat API
// ================================

app.post("/api/chat", async (req, res) => {
  try {
    const {
      topicTitle,
      topicSummary,
      question,
      conversationHistory = []
    } = req.body;

    if (!question) {
      return res.status(400).json({
        error: "Question is required."
      });
    }

    const prompt = `
You are a friendly scientist.

The user is currently learning about:
"${topicTitle}"

Topic summary:
"${topicSummary}"

Answer the user's question clearly.

Keep the answer concise:
2-4 sentences.

User question:
"${question}"
`;

    const contents = [
      {
        role: "user",
        parts: [{ text: prompt }]
      },
      ...conversationHistory
    ];

    const result = await askGemini(contents, {
      temperature: 0.5
    });

    res.json({
      answer: result
    });

  } catch (error) {
    console.error("Chat API error:", error);

    res.status(500).json({
      error: error.message
    });
  }
});


// ================================
// Server
// ================================

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      `🚀 CosmoLearn server running at http://localhost:${PORT}`
    );
  });
}

module.exports = app;