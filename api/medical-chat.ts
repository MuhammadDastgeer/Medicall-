export default async function handler(req: any, res: any) {
  // Check if method is POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method Not Allowed" } });
  }

  try {
    const { messages, apiKeyOverride } = req.body;
    const apiKey = apiKeyOverride || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        error: {
          message: "OpenAI API Key is missing. Please set the OPENAI_API_KEY environment variable in settings or enter it in the top input bar."
        }
      });
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      let errJson;
      try {
        errJson = JSON.parse(errText);
      } catch (_) {}
      return res.status(response.status).json({
        error: {
          message: errJson?.error?.message || `OpenAI API returned status ${response.status}: ${errText}`
        }
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err: any) {
    console.error("Exception in Vercel API /api/medical-chat:", err);
    return res.status(500).json({
      error: {
        message: err.message || "Internal server error occurred."
      }
    });
  }
}
