const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export async function login(username, password) {
  return request("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}

export async function transcribeAudio({ audioBlob, sessionId, languageHint }) {
  const form = new FormData();
  form.append("audio", audioBlob, "recording.webm");
  form.append("session_id", sessionId);
  if (languageHint) form.append("language_hint", languageHint);
  return request("/transcribe", { method: "POST", body: form });
}

export async function translateText({ text, source_language, target_language }) {
  return request("/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, source_language, target_language }),
  });
}

export async function detectIntent({ text, session_id }) {
  return request("/detect-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, session_id }),
  });
}

export async function generateResponse(payload) {
  return request("/generate-response", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function generateSummary(payload) {
  return request("/generate-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function textToSpeech({ text, languageCode, sessionId }) {
  const form = new FormData();
  form.append("text", text);
  form.append("language_code", languageCode);
  form.append("session_id", sessionId);
  const res = await fetch(`${BASE}/text-to-speech`, { method: "POST", body: form });
  if (!res.ok) throw new Error("TTS failed");
  return res.blob();
}

export async function getHistory(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request(`/history${qs ? "?" + qs : ""}`);
}

export async function getAnalytics(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request(`/analytics${qs ? "?" + qs : ""}`);
}
