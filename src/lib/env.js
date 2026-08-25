const PROD_API_URL = "https://civic-link-backend.onrender.com/api";
const PROD_AI_SERVICE_URL = "https://civic-link-ai-agent.onrender.com";
const LOCAL_API_URL = "/api";
const LOCAL_AI_SERVICE_URL = "http://localhost:8001";

function stripTrailingSlash(url) {
  return String(url || "").replace(/\/$/, "");
}

/**
 * Vite loads `.env.development` for `npm run dev` and `.env.production` for
 * `npm run build`. Fallbacks still split on DEV vs production so a missing
 * env file does not send local traffic to Render (or bake `/api` into a
 * production build).
 */
export function getApiBase() {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) return stripTrailingSlash(fromEnv);
  return import.meta.env.DEV ? LOCAL_API_URL : PROD_API_URL;
}

export function getAiServiceUrl() {
  const fromEnv = import.meta.env.VITE_AI_SERVICE_URL?.trim();
  if (fromEnv) return stripTrailingSlash(fromEnv);
  return import.meta.env.DEV ? LOCAL_AI_SERVICE_URL : PROD_AI_SERVICE_URL;
}
