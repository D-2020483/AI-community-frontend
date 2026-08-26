import { getAiServiceUrl } from "./env.js";

const AI_SERVICE_URL = getAiServiceUrl();

/**
 * Reads a File/Blob as a base64 data URL
 * (e.g. "data:image/jpeg;base64,/9j/4AAQ...").
 */
export function isAbortError(err) {
  return (
    err?.name === "AbortError" ||
    err?.cancelled === true ||
    err?.code === "ERR_CANCELED"
  );
}

function cancelledError() {
  const error = new Error("Report submission cancelled.");
  error.name = "AbortError";
  error.cancelled = true;
  return error;
}

function fileToDataUrl(file, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(cancelledError());
      return;
    }

    const reader = new FileReader();
    const onAbort = () => {
      reader.abort();
      reject(cancelledError());
    };

    signal?.addEventListener("abort", onAbort, { once: true });
    reader.onload = () => {
      signal?.removeEventListener("abort", onAbort);
      resolve(reader.result);
    };
    reader.onerror = () => {
      signal?.removeEventListener("abort", onAbort);
      reject(new Error("Could not read the selected file"));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Sends the photo + form context to POST /api/reports/analyze and returns
 * the parsed ReportAnalyzeResponse (see ai-service/schemas.py).
 *
 * Throws an Error with a user-facing message on failure.
 */
export async function analyzeReport({
  file,
  category,
  description,
  location,
  signal,
}) {
  if (!file) throw new Error("Please attach a photo of the issue.");
  if (!description?.trim()) throw new Error("Please describe the issue.");
  if (!location?.trim()) throw new Error("Please set a location.");

  const imageDataUrl = await fileToDataUrl(file, signal);
  if (signal?.aborted) throw cancelledError();

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
      signal,
    });
  } catch (networkErr) {
    if (isAbortError(networkErr) || signal?.aborted) throw cancelledError();
    throw new Error(
      "Couldn't reach the AI service. Is it running at " + AI_SERVICE_URL + "?",
    );
  }

  if (signal?.aborted) throw cancelledError();

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

  const result = await response.json();
  if (signal?.aborted) throw cancelledError();
  return result;
}