import express from "express";
import path from "path";
import dotenv from "dotenv";
import axios from "axios";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.NODE_ENV === "production"
    ? parseInt(process.env.PORT || "5030")
    : parseInt(process.env.PORT || "3000");

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

      // Perform request with Axios and automatic retry
      let attempts = 3;
      let delayMs = 500;
      let responseData: any = null;
      let responseStatus = 200;
      let lastError: any = null;

      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          const response = await axios({
            url: targetUrl,
            method: req.method,
            headers: {
              "Authorization": `Bearer ${token}`,
              "Accept": "application/json",
              "Content-Type": "application/json",
            },
            data: ["POST", "PUT", "PATCH"].includes(req.method) ? req.body : undefined,
            timeout: 10000 // 10 second timeout
          });
          responseData = response.data;
          responseStatus = response.status;
          break;
        } catch (err: any) {
          lastError = err;
          const status = err.response?.status;
          
          // Don't retry on 4xx user errors as they are fully client-authoritative
          const isUserError = status && status >= 400 && status < 500;
          
          console.warn(
            `[Proxy] Attempt ${attempt}/${attempts} to TMDB failed.` +
            ` Status: ${status || 'Network Error'}. Error: ${err.message}.` +
            (isUserError ? " Permanent 4xx error. Skipping retries." : "")
          );

          if (isUserError || attempt === attempts) {
            break;
          }

          // Delay before next attempt
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          delayMs *= 2;
        }
      }

      if (responseData) {
        res.status(responseStatus).json(responseData);
      } else {
        const status = lastError.response?.status || 500;
        const errorData = lastError.response?.data || {};
        res.status(status).json({
          error: `TMDB API returned error: ${lastError.message}`,
          details: typeof errorData === "object" ? errorData : { raw: String(errorData) },
          code: "TMDB_ERROR"
        });
      }
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
    console.log("[Server] Serving production views output as dynamic EJS template...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Set up EJS view engine with compiler support
    app.set("view engine", "ejs");
    app.set("views", distPath);

    // Serve all assets dynamically, but bypass serving index.html as a static asset since we render EJS instead
    app.use(express.static(distPath, { index: false }));
    
    app.get("*", (req, res) => {
      res.render("index", {
        env: {
          NODE_ENV: process.env.NODE_ENV,
          TMDB_CONFIGURED: !!process.env.TMDB_ACCESS_TOKEN
        }
      });
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
