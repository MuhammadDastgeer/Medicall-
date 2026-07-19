import express from "express";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to expose Supabase configuration to the client dynamically at runtime
  app.get("/api/config", (req, res) => {
    res.json({
      supabaseUrl: process.env.VITE_SUPABASE_URL || "",
      supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || ""
    });
  });

  // Log on startup
  console.log("Starting server...");
  console.log("Environment NODE_ENV:", process.env.NODE_ENV);
  console.log("OpenAI API Key configured in env:", !!process.env.OPENAI_API_KEY);
  console.log("Supabase URL configured in env:", !!process.env.VITE_SUPABASE_URL);

  // API Route for ChatGPT Medical Advisor
  app.post("/api/medical-chat", async (req, res) => {
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
      return res.json(data);
    } catch (err: any) {
      console.error("Exception in /api/medical-chat:", err);
      return res.status(500).json({
        error: {
          message: err.message || "Internal server error occurred."
        }
      });
    }
  });

  let isProduction = process.env.NODE_ENV === "production" || (typeof __filename !== "undefined" && __filename.includes("dist"));

  if (!isProduction) {
    try {
      // Robust dynamic check: if Vite is not installed or available, we must run in production mode
      await import("vite");
      console.log("Vite is available. Proceeding in development mode.");
    } catch (e) {
      console.log("Vite is NOT available (pruned production environment). Falling back to serving static files in production mode.");
      isProduction = true;
    }
  }

  // Vite middleware for development
  if (!isProduction) {
    console.log("Loading Vite in development mode...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static files in production mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
