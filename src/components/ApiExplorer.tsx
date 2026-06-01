import React, { useState } from "react";
import { Terminal, Play, Cpu, Server, Code, Copy, Check, Loader2 } from "lucide-react";

interface ApiEndpoint {
  id: string;
  method: "GET" | "POST";
  path: string;
  description: string;
  params: Record<string, string>;
}

export const ApiExplorer: React.FC = () => {
  const [activeEndpoint, setActiveEndpoint] = useState<string>("trending");
  const [responseJson, setResponseJson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, string>>({
    movieId: "550", // Fight club as default
    query: "Matrix",
  });

  const endpoints: ApiEndpoint[] = [
    {
      id: "trending",
      method: "GET",
      path: "/api/tmdb/trending/all/day",
      description: "Retrieve a list of the daily trending movies and TV shows.",
      params: {}
    },
    {
      id: "details",
      method: "GET",
      path: "/api/tmdb/movie/{movieId}",
      description: "Retrieve all core metadata details for a single movie by ID, including companion cast and video tags.",
      params: { movieId: "The TMDB numeric ID of the movie." }
    },
    {
      id: "genres",
      method: "GET",
      path: "/api/tmdb/genre/movie/list",
      description: "Get the complete official TMDB list of genre tags available for classifying films.",
      params: {}
    },
    {
      id: "search",
      method: "GET",
      path: "/api/tmdb/search/movie",
      description: "Search the global TMDB movie database matching any title or keyword string query.",
      params: { query: "A valid string search keyword." }
    }
  ];

  const currentEndpoint = endpoints.find(e => e.id === activeEndpoint) || endpoints[0];

  const handleRunRequest = async () => {
    setIsLoading(true);
    setResponseJson(null);

    let finalPath = currentEndpoint.path;
    // Replace URL path params if applicable
    if (finalPath.includes("{movieId}")) {
      finalPath = finalPath.replace("{movieId}", paramValues.movieId);
    }

    // Append search params if applicable
    const qProps = new URLSearchParams();
    if (activeEndpoint === "search") {
      qProps.append("query", paramValues.query);
    }

    const requestUrl = `${finalPath}${qProps.toString() ? `?${qProps.toString()}` : ""}`;

    try {
      const res = await fetch(requestUrl);
      const data = await res.json();
      setResponseJson(data);
    } catch (err: any) {
      setResponseJson({
        error: "Failed to resolve proxy tunnel.",
        details: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const codeSnippet = `// Quick Node.js proxy call to Bitcine API
const fetchFromBitcine = async () => {
  const url = "${window.location.origin}${currentEndpoint.path.replace("{movieId}", paramValues.movieId)}${activeEndpoint === "search" ? `?query=${paramValues.query}` : ""}";
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
  } catch (err) {
    console.error("API error:", err);
  }
};
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="api-explorer-view" className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto animate-[fadeIn_0.4s_ease-out]">
      {/* Title Header */}
      <div className="flex flex-col gap-1 mb-8 border-b border-purple-500/10 pb-6">
        <h1 className="text-[#f8fafc] text-lg font-black tracking-widest flex items-center gap-2 uppercase">
          <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
          Developer Hub
        </h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">
          Learn how Bitcine communicates with the TMDB API. Test server-side proxied endpoints on-demand and inspect raw JSON payloads.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left endpoint selector */}
        <div id="endpoints-selector-sidebar" className="lg:col-span-1 flex flex-col gap-4">
          <h2 className="text-sm uppercase font-extrabold tracking-widest text-slate-400">Available Router Scopes</h2>
          <div className="flex flex-col gap-2.5">
            {endpoints.map((endpoint) => (
              <button
                key={endpoint.id}
                id={`endpoint-btn-${endpoint.id}`}
                onClick={() => {
                  setActiveEndpoint(endpoint.id);
                  setResponseJson(null);
                }}
                className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  activeEndpoint === endpoint.id
                    ? "bg-[#120e2a] border-violet-500/50 shadow-md shadow-violet-500/10"
                    : "bg-[#0d0a1b] hover:bg-[#120e24]/40 border-purple-500/5 hover:border-purple-500/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-black uppercase text-violet-400 bg-violet-950/50 border border-violet-500/20 px-2 py-0.5 rounded">
                    {endpoint.method}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-200 truncate">
                    {endpoint.path}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {endpoint.description}
                </p>
              </button>
            ))}
          </div>

          {/* Quick Connection Details Banner */}
          <div className="bg-purple-950/20 border border-purple-500/10 rounded-2xl p-4.5 flex gap-3 text-xs text-slate-300 mt-2">
            <Server className="w-5 h-5 text-violet-400 flex-shrink-0" />
            <div className="flex flex-col gap-1">
              <span className="font-bold text-white">Proxy Security Enabled</span>
              <p className="leading-relaxed">All outbound calls securely encapsulate cookies and header authorization tokens server-side, preventing token leakage inside the user's browser.</p>
            </div>
          </div>
        </div>

        {/* Right request editor / output HUD */}
        <div id="endpoint-playground-panel" className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Active endpoint detail and input params */}
          <div className="bg-[#0f0a1f] rounded-2xl p-5 border border-purple-500/10">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-violet-400" />
              Configure Payload Parameters
            </h2>
            
            <p className="text-xs text-slate-400 mb-4">{currentEndpoint.description}</p>

            {/* Path parameter inputs */}
            {currentEndpoint.path.includes("{movieId}") && (
              <div className="flex flex-col gap-2 mb-4">
                <label className="text-xs font-bold text-slate-300">movieId</label>
                <input
                  type="text"
                  value={paramValues.movieId}
                  onChange={(e) => setParamValues({ ...paramValues, movieId: e.target.value })}
                  className="bg-[#050110] text-white border border-slate-800 rounded-xl px-3.5 py-2 text-xs focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 w-full md:w-1/2"
                />
                <span className="text-[10px] text-slate-400">Example: 550 (Fight Club), 27205 (Inception)</span>
              </div>
            )}

            {activeEndpoint === "search" && (
              <div className="flex flex-col gap-2 mb-4">
                <label className="text-xs font-bold text-slate-300">query</label>
                <input
                  type="text"
                  value={paramValues.query}
                  onChange={(e) => setParamValues({ ...paramValues, query: e.target.value })}
                  className="bg-[#050110] text-white border border-slate-800 rounded-xl px-3.5 py-2 text-xs focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 w-full md:w-1/2"
                />
              </div>
            )}

            {/* Run Request Trigger */}
            <button
              onClick={handleRunRequest}
              disabled={isLoading}
              className="mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-900 rounded-xl py-2.5 px-6 font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-98 transition-all flex items-center gap-2 shadow-lg shadow-violet-500/10"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executing Tunnel...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Execute Endpoint Search</span>
                </>
              )}
            </button>
          </div>

          {/* Response payload viewer */}
          <div className="bg-[#0d0a1b] rounded-2xl border border-purple-500/10 overflow-hidden flex flex-col h-[320px]">
            <div className="bg-slate-950 px-4 py-2.5 border-b border-purple-500/5 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold font-mono tracking-wider">RESPONSE PAYLOAD</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold font-mono">
                {responseJson ? "200 OK" : "IDLE"}
              </span>
            </div>
            <div className="p-4 overflow-auto font-mono text-[10px] md:text-xs text-slate-300 flex-1 leading-relaxed bg-[#050110]/70 antialiased">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                </div>
              ) : responseJson ? (
                <pre>{JSON.stringify(responseJson, null, 2)}</pre>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 italic text-center text-xs">
                  Click 'Execute Endpoint Search' to perform an active test query inside our virtual container network.
                </div>
              )}
            </div>
          </div>

          {/* Client-Side Integration Code snippet */}
          <div className="bg-[#0f0a1f] rounded-2xl p-5 border border-purple-500/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Code className="w-4 h-4 text-violet-400" />
                Integration Code Snippet
              </h3>
              <button
                onClick={copyToClipboard}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed text-violet-300">
              <pre>{codeSnippet}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
