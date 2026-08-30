```js
// js/api.js

"use strict";


// ==================================================
// FETCH SCIENCE TOPIC
// ==================================================

async function fetchScienceTopic(topicName) {

  const response = await fetch("/api/gemini", {
    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      type: "topic",
      topic: topicName
    })
  });


  const data =
    await response.json().catch(() => ({}));


  if (!response.ok) {

    console.error(
      "Topic API error:",
      data
    );

    if (response.status === 429) {
      throw new Error("QUOTA_EXCEEDED");
    }

    if (
      response.status === 400 ||
      response.status === 403
    ) {
      throw new Error("BAD_API_KEY");
    }

    if (response.status === 404) {
      throw new Error("GEMINI_MODEL_NOT_FOUND");
    }

    throw new Error(
      data.error || "GEMINI_ERROR"
    );
  }


  return data;
}


// ==================================================
// ASK THE SCIENTIST
// ==================================================

async function askScientist(
  topicContext,
  conversationHistory,
  question
) {

  const response = await fetch("/api/gemini", {
    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({

      type: "chat",

      topicTitle:
        topicContext?.title || "Science",

      topicSummary:
        topicContext?.summary || "",

      question: question,

      conversationHistory:
        Array.isArray(conversationHistory)
          ? conversationHistory
          : []
    })
  });


  const data =
    await response.json().catch(() => ({}));


  if (!response.ok) {

    console.error(
      "Chat API error:",
      data
    );

    if (response.status === 429) {
      throw new Error("QUOTA_EXCEEDED");
    }

    if (
      response.status === 400 ||
      response.status === 403
    ) {
      throw new Error("BAD_API_KEY");
    }

    if (response.status === 404) {
      throw new Error("GEMINI_MODEL_NOT_FOUND");
    }

    throw new Error(
      data.error || "NETWORK_ERROR"
    );
  }


  if (data.error) {
    throw new Error(data.error);
  }


  return (
    data.answer ||
    "Sorry, I couldn't generate a response."
  );
}
```
