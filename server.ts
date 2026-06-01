import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route - Dynamic TMDB Proxy endpoint to keep token secure
  app.all("/api/tmdb/*", async (req, res) => {
    try {
      const apiPath = req.params[0]; // Gets the sub-path after /api/tmdb/
      if (!apiPath) {
        return res.status(400).json({ error: "Missing TMDB API endpoint path" });
      }

      // Convert local query params back into standard string URL query
      const queryParams = new URLSearchParams();
      for (const [key, val] of Object.entries(req.query)) {
        if (typeof val === "string") {
          queryParams.append(key, val);
        } else if (Array.isArray(val)) {
          val.forEach((v) => queryParams.append(key, String(v)));
        }
      }

      const token = process.env.TMDB_ACCESS_TOKEN;
      const baseUrl = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";

      if (!token) {
        return res.status(500).json({
          error: "TMDB_ACCESS_TOKEN is not configured on the server. Please define it in your environment or Secrets tab.",
          code: "MISSING_TOKEN"
        });
      }

      const targetUrl = `${baseUrl}/${apiPath}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      console.log(`[Proxy] Fetching from TMDB: ${targetUrl.replace(token, "[REDACTED]")}`);

      const response = await fetch(targetUrl, {
        method: req.method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: ["POST", "PUT", "PATCH"].includes(req.method) ? JSON.stringify(req.body) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({
          error: `TMDB API returned error status ${response.status}`,
          details: errorText,
          code: "TMDB_ERROR"
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      console.error("[Proxy] TMDB failure:", err);
      res.status(500).json({
        error: "Failed to communicate with TMDB streaming API catalog.",
        details: err.message,
        code: "INTERNAL_PROXY_ERROR"
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      tmdbConfigured: !!process.env.TMDB_ACCESS_TOKEN,
      timestamp: new Date().toISOString()
    });
  });

  // Vite development / static production middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Registering Vite development middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Server] Serving production static assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Bitcine Full-Stack App running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[Server] Fatal startup error:", err);
  process.exit(1);
});
