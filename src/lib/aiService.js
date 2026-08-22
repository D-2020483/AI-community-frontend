// Base URL of the FastAPI ai-service (main.py).
// Override with VITE_AI_SERVICE_URL for local uvicorn (http://localhost:8001).
const AI_SERVICE_URL =
  import.meta.env.VITE_AI_SERVICE_URL ||
  "https://civic-link-ai-agent.onrender.com";

/**
 * Reads a File/Blob as a base64 data URL
 * (e.g. "data:image/jpeg;base64,/9j/4AAQ...").
 */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Sends the photo + form context to POST /api/reports/analyze and returns
 * the parsed ReportAnalyzeResponse (see ai-service/schemas.py).
 *
 * Throws an Error with a user-facing message on failure.
 */
export async function analyzeReport({ file, category, description, location }) {
  if (!file) throw new Error("Please attach a photo of the issue.");
  if (!description?.trim()) throw new Error("Please describe the issue.");
  if (!location?.trim()) throw new Error("Please set a location.");

  const imageDataUrl = await fileToDataUrl(file);

  let response;
  try {
    response = await fetch(`${AI_SERVICE_URL}/api/reports/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_base64: imageDataUrl,
        image_media_type: file.type || "image/jpeg",
        category: category || null,
        description,
        location,
      }),
    });
  } catch (networkErr) {
    throw new Error(
      "Couldn't reach the AI service. Is it running at " + AI_SERVICE_URL + "?",
    );
  }

  if (!response.ok) {
    let detail = `AI analysis failed (${response.status})`;
    try {
      const body = await response.json();
      if (body?.detail) detail = body.detail;
    } catch {
      /* response wasn't JSON, keep default message */
    }
    throw new Error(detail);
  }

  return response.json(); // ReportAnalyzeResponse
}