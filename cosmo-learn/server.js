require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve website files
app.use(express.static(__dirname));


app.use(express.static(path.join(__dirname, "public")));// ==========================
// GEMINI HELPER
// ==================================================

async function askGemini(contents, generationConfig = {}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in .env");
  }

  const models = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash-lite"
  ];

  let lastError = null;

  for (const model of models) {
    try {
      console.log("Trying Gemini model:", model);

      const url =
        "https://generativelanguage.googleapis.com/v1beta/models/" +
        model +
        ":generateContent?key=" +
        apiKey;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: generationConfig
        })
      });

      const data = await response.json();

      if (response.ok) {
        const text =
          data.candidates?.[0]?.content?.parts?.[0]?.text;

        return text || "No response generated.";
      }

      console.error("Gemini model failed:", model, data);

      lastError = new Error(
        data.error?.message || "Gemini API error"
      );

      if (
        response.status !== 429 &&
        response.status !== 500 &&
        response.status !== 503
      ) {
        throw lastError;
      }
    } catch (error) {
      console.error("Gemini request failed:", model, error);
      lastError = error;
    }
  }

  throw lastError || new Error("All Gemini models failed.");
}
// ==================================================
// TOPIC API
// ==================================================

app.post("/api/topic", async (req, res) => {
  try {
    const topic = req.body.topic;

    if (!topic) {
      return res.status(400).json({
        error: "Topic is required."
      });
    }

    const prompt = `
You are an expert scientific educator.

Create an interactive science learning module about:

"${topic}"

Return ONLY valid JSON.

Use exactly this structure:

{
  "title": "string",
  "category": "string",
  "summary": "string",
  "keyMechanics": [
    "string",
    "string",
    "string"
  ],
  "latexFormula": "string",
  "formulaExplanation": "string",
  "realWorldApplication": "string",
  "quiz": [
    {
      "question": "string",
      "options": [
        "string",
        "string",
        "string",
        "string"
      ],
      "correctIndex": 0,
      "explanation": "string"
    }
  ]
}

Rules:

- summary must contain exactly 2 sentences.
- keyMechanics must contain exactly 3 items.
- quiz must contain exactly 3 questions.
- every quiz question must have exactly 4 options.
- correctIndex must be 0, 1, 2, or 3.
- Make the science accurate.
- Make the explanation understandable for students.
- latexFormula must contain a valid LaTeX formula.
`;

    const result = await askGemini(
      [
        {
          role: "user",
          parts: [
            {
              text: prompt
            }
          ]
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
      console.error(
        "Invalid JSON from Gemini:",
        result
      );

      return res.status(500).json({
        error: "Gemini returned invalid JSON."
      });
    }

    return res.json(parsed);

  } catch (error) {
    console.error("Topic API error:", error);

    return res.status(500).json({
      error: error.message
    });
  }
});

// ==================================================
// CHAT API
// ==================================================

app.post("/api/chat", async (req, res) => {
  try {
    const {
      topicTitle,
      topicSummary,
      question,
      conversationHistory
    } = req.body;

    if (!question) {
      return res.status(400).json({
        error: "Question is required."
      });
    }

    const history = Array.isArray(conversationHistory)
      ? conversationHistory
      : [];

    const systemPrompt = `
You are a friendly female scientist helping a student.

The student is currently learning about:

${topicTitle || "science"}

Topic summary:

${topicSummary || ""}

Answer the student's question clearly and accurately.

Keep the answer concise, around 2 to 4 sentences.

Use simple language where possible.
`;

    // Start with the instruction as a USER message.
    // Then add only valid alternating history.
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: systemPrompt
          }
        ]
      }
    ];

    let expectedRole = "model";

    for (const item of history) {
      if (!item) {
        continue;
      }

      if (
        item.role !== "user" &&
        item.role !== "model"
      ) {
        continue;
      }

      if (
        !Array.isArray(item.parts) ||
        item.parts.length === 0
      ) {
        continue;
      }

      // Only accept the role we expect next.
      if (item.role !== expectedRole) {
        continue;
      }

      contents.push({
        role: item.role,
        parts: item.parts
      });

      expectedRole =
        expectedRole === "user"
          ? "model"
          : "user";
    }

    // VERY IMPORTANT:
    // The request must always finish with USER.
    contents.push({
      role: "user",
      parts: [
        {
          text: question
        }
      ]
    });

   const result = await askGemini(contents);

    return res.json({
      answer: result
    });

  } catch (error) {
    console.error("Chat API error:", error);

    return res.status(500).json({
      error: error.message
    });
  }
});

// ==================================================
// START SERVER
// ==================================================

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      "CosmoLearn server running at http://localhost:" +
      PORT
    );
  });
}

module.exports = app;


