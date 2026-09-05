const API_BASE = "https://api.swiftinbox.xyz";

// basic rate limiting for auth endpoints
// auth stuff registers/logins uses simple ip limit since they are not logged in yet
// other plans rate limit is checked on the main backend
const AUTH_RATE_WINDOW = 60_000;  // 1 minute
const AUTH_RATE_MAX = 6;          // 6 attempts/min per IP

const hits = new Map();

function rateLimit(ip, max = AUTH_RATE_MAX, windowMs = AUTH_RATE_WINDOW) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.windowStart > windowMs) {
    hits.set(ip, { windowStart: now, count: 1 });
    return { allowed: true, remaining: max - 1 };
  }
  if (entry.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.windowStart + windowMs - now) / 1000),
    };
  }
  entry.count++;
  return { allowed: true, remaining: max - entry.count };
}

// helper functions

function error(body, status = 400) {
  return Response.json(body, {
    status,
    headers: {
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
}

function ok(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
}

function validateEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getClientIp(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

// proxy auth requests to the backend with the master key

async function proxyAuth(request, endpoint, bodyFields) {
  const ip = getClientIp(request);
  const rl = rateLimit(ip);
  if (!rl.allowed) {
    return error(
      { error: "Too many attempts. Try again shortly.", retryAfter: rl.retryAfter },
      429
    );
  }

  if (request.method !== "POST") {
    return error({ error: "Method not allowed" }, 405);
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return error({ error: "Expected JSON" }, 415);
  }

  const masterKey = process.env.SWIFTMAIL_MASTER_KEY;
  if (!masterKey) {
    return error({ error: "Service temporarily unavailable" }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return error({ error: "Invalid request body" }, 400);
  }

  for (const field of bodyFields) {
    if (!body[field]) {
      return error({ error: `Missing field: ${field}` }, 400);
    }
  }

  if (body.email && !validateEmail(body.email)) {
    return error({ error: "Invalid email address" }, 400);
  }
  if (body.password && body.password.length < 6) {
    return error({ error: "Password must be at least 6 characters" }, 400);
  }
  if (body.code && (typeof body.code !== "string" || !/^\d{4,6}$/.test(body.code))) {
    return error({ error: "Invalid verification code" }, 400);
  }

  const payload = {};
  for (const field of bodyFields) {
    payload[field] = body[field];
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-key": masterKey,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json();
    return ok(data, res.status);
  } catch (err) {
    if (err.name === "AbortError") {
      return error({ error: "Upstream timeout, please retry" }, 504);
    }
    return error({ error: "Service temporarily unavailable" }, 503);
  }
}

// endpoint handlers

export async function handleRegister(request) {
  return proxyAuth(request, "register", ["email", "password"]);
}

export async function handleVerify(request) {
  return proxyAuth(request, "verify", ["email", "code"]);
}

export async function handleLogin(request) {
  return proxyAuth(request, "login", ["email", "password"]);
}
