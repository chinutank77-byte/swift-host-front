// auth routes use /api/auth/*, inbox routes go direct unless it is drop plan

const API_BASE_URL = "https://api.swiftinbox.xyz";
const PROXY_BASE = "/api/api";

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: text };
  }

  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// drop tier goes to proxy to inject keys, rest go direct to avoid proxy overhead
function inboxUrl(path, apiKey, plan) {
  if (apiKey && plan === "drop") return `${PROXY_BASE}/${path}`;
  return `${API_BASE_URL}/${path}`;
}

export async function register(email, password, cfToken) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      // TODO: backend should verify this token via Cloudflare Turnstile secret key
      ...(cfToken ? { cf_turnstile_token: cfToken } : {}),
    }),
  });
}

export async function verify(email, code) {
  return apiFetch("/api/auth/verify", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function login(email, password) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchMe(apiKey) {
  return apiFetch("/api/me", {
    method: "POST",
    body: JSON.stringify({ api_key: apiKey }),
  });
}

export async function createInboxes(apiKey, options = {}, plan = null, cfToken) {
  const headers = {};
  if (apiKey) headers["x-api-key"] = apiKey;
  return apiFetch(inboxUrl("create", apiKey, plan), {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...options,
      // TODO: backend should verify this token via Cloudflare Turnstile secret key
      ...(cfToken ? { cf_turnstile_token: cfToken } : {}),
    }),
  });
}

export async function fetchInboxes(apiKey, plan = null) {
  const headers = {};
  if (apiKey) headers["x-api-key"] = apiKey;
  return apiFetch(inboxUrl("inboxes", apiKey, plan), { headers });
}

export async function fetchInboxMessages(apiKey, email, plan = null) {
  const headers = {};
  if (apiKey) headers["x-api-key"] = apiKey;
  return apiFetch(inboxUrl(`inbox/${encodeURIComponent(email)}`, apiKey, plan), { headers });
}

export async function deleteInboxes(apiKey, options, plan = null) {
  const headers = {};
  if (apiKey) headers["x-api-key"] = apiKey;
  return apiFetch(inboxUrl("delete-inboxes", apiKey, plan), {
    method: "DELETE",
    headers,
    body: JSON.stringify(options),
  });
}

export async function reactivateInbox(apiKey, email, plan = null) {
  const headers = {};
  if (apiKey) headers["x-api-key"] = apiKey;
  return apiFetch(inboxUrl("reactivate", apiKey, plan), {
    method: "POST",
    headers,
    body: JSON.stringify({ email }),
  });
}

export function getAttachmentUrl(id) {
  // attachments direct to swiftmail because of size
  return `${API_BASE_URL}/attachment/${encodeURIComponent(id)}`;
}

export async function fetchPublicInbox(email) {
  return apiFetch(`${API_BASE_URL}/email-login/${encodeURIComponent(email)}`);
}

export function getStreamUrl(inboxEmail) {
  // sse stream goes direct to avoid vercel timeout
  return `${API_BASE_URL}/email-stream/${encodeURIComponent(inboxEmail)}`;
}
