import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Helper for delay inside the retry loop
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function handleProxy(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> | { path?: string[] } }
) {
  try {
    // Standard Next.js 14 & 15 param resolution compatibility
    const resolvedParams = "then" in context.params ? await context.params : context.params;
    const pathParts = resolvedParams?.path || [];
    const apiPath = pathParts.join("/");

    if (!apiPath) {
      return NextResponse.json({ error: "Missing TMDB API endpoint path" }, { status: 400 });
    }

    // Convert Next.js UrlSearchParams into search key-value sets
    const { searchParams } = new URL(req.url);
    const queryParams = new URLSearchParams();
    searchParams.forEach((val, key) => {
      queryParams.append(key, val);
    });

    const token = process.env.TMDB_ACCESS_TOKEN;
    const baseUrl = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";

    if (!token) {
      return NextResponse.json({
        error: "TMDB_ACCESS_TOKEN is not configured on the server. Please define it in your environment or Secrets tab.",
        code: "MISSING_TOKEN"
      }, { status: 500 });
    }

    const targetUrl = `${baseUrl}/${apiPath}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    // Read payload body if appropriate
    let requestBody: any = undefined;
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      try {
        requestBody = await req.json();
      } catch {
        // Fallback for empty/unparsable JSON
      }
    }

    console.log(`[Proxy] Fetching from TMDB: ${targetUrl.replace(token, "[REDACTED]")}`);

    // Perform request with Axios and automatic retry
    const attempts = 3;
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
          data: requestBody,
          timeout: 10000 // 10 second timeout
        });
        responseData = response.data;
        responseStatus = response.status;
        break;
      } catch (err: any) {
        lastError = err;
        const status = err.response?.status;
        
        // Don't retry on 4xx user errors as they represent fully client-authoritative states
        const isUserError = status && status >= 400 && status < 500;
        
        console.warn(
          `[Proxy] Attempt ${attempt}/${attempts} to TMDB failed.` +
          ` Status: ${status || 'Network Error'}. Error: ${err.message}.` +
          (isUserError ? " Permanent 4xx error. Skipping retries." : "")
        );

        if (isUserError || attempt === attempts) {
          break;
        }

        // Delay before retry
        await delay(delayMs);
        delayMs *= 2; // Exponential backoff scaling
      }
    }

    if (responseData) {
      return NextResponse.json(responseData, { status: responseStatus });
    } else {
      const status = lastError.response?.status || 500;
      const errorData = lastError.response?.data || {};
      return NextResponse.json({
        error: `TMDB API returned error: ${lastError.message}`,
        details: typeof errorData === "object" ? errorData : { raw: String(errorData) },
        code: "TMDB_ERROR"
      }, { status });
    }
  } catch (err: any) {
    console.error("[Proxy] TMDB failure:", err);
    return NextResponse.json({
      error: "Failed to communicate with TMDB streaming API catalog.",
      details: err.message,
      code: "INTERNAL_PROXY_ERROR"
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest, context: any) {
  return handleProxy(req, context);
}

export async function POST(req: NextRequest, context: any) {
  return handleProxy(req, context);
}

export async function PUT(req: NextRequest, context: any) {
  return handleProxy(req, context);
}

export async function DELETE(req: NextRequest, context: any) {
  return handleProxy(req, context);
}
