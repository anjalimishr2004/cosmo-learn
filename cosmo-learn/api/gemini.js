const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function askGemini(contents, generationConfig = {}) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash"
  });

  const result = await model.generateContent({
    contents,
    generationConfig
  });

  return result.response.text();
}


// ======================================================
// VERCEL SERVERLESS FUNCTION
// ======================================================

module.exports = async (req, res) => {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const {
      type,
      topic,
      topicTitle,
      topicSummary,
      question,
      conversationHistory = []
    } = req.body;


    // ==================================================
    // TOPIC GENERATION
    // ==================================================

    if (type === "topic") {

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
- summary should be exactly 2 sentences.
- keyMechanics should contain exactly 3 items.
- quiz should contain exactly 3 questions.
- every quiz question must have exactly 4 options.
- correctIndex must be 0, 1, 2, or 3.
- latexFormula must contain ONLY the LaTeX expression.
- Do NOT use $, $$, \\(, \\), or Markdown code blocks around the formula.
- Make the science accurate and understandable.
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
    }


    // ==================================================
    // CHAT
    // ==================================================

    if (type === "chat") {

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
          parts: [
            {
              text: prompt
            }
          ]
        },
        ...conversationHistory
      ];


      const result = await askGemini(
        contents,
        {
          temperature: 0.5
        }
      );


      return res.json({
        answer: result
      });
    }


    // ==================================================
    // INVALID TYPE
    // ==================================================

    return res.status(400).json({
      error: "Invalid request type."
    });


  } catch (error) {

    console.error(
      "Gemini API error:",
      error
    );

    return res.status(500).json({
      error: error.message || "Gemini API error"
    });
  }
};