// js/api.js
// Frontend talks ONLY to our backend.
// API key is NEVER stored in this file.


// ======================================================
// GENERATE SCIENCE TOPIC
// ======================================================

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


  if (!response.ok) {

    const data = await response.json().catch(() => ({}));

    console.error("Topic API error:", data);

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

    throw new Error("GEMINI_ERROR");
  }


  const data = await response.json();


  if (data.error) {

    console.error(
      "Backend topic error:",
      data.error
    );

    throw new Error("GEMINI_ERROR");
  }


  return data;
}



// ======================================================
// ASK THE SCIENTIST
// ======================================================

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
        topicContext.title,

      topicSummary:
        topicContext.summary,

      question:
        question,

      conversationHistory:
        conversationHistory || []

    })

  });


  if (!response.ok) {

    const data =
      await response.json()
        .catch(() => ({}));

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


    throw new Error("NETWORK_ERROR");
  }


  const data =
    await response.json();


  if (data.error) {

    console.error(
      "Backend chat error:",
      data.error
    );

    throw new Error("NETWORK_ERROR");
  }


  return (
    data.answer ||
    "Sorry, I couldn't generate a response."
  );
}