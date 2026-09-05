import { NextResponse } from "next/server";
import crypto from "crypto";

const API_BASE = "https://api.swiftinbox.xyz";
const ALLOWED_SEGMENTS = new Set([
  "create",
  "inboxes",
  "inbox",
  "message",
  "delete-inboxes",
  "reactivate",
]);

const rateLimitHits = new Map();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 60;

function getFingerprint(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ua = request.headers.get("user-agent") || "";
  const lang = request.headers.get("accept-language") || "";
  
  const hash = crypto.createHash("sha256");
  hash.update(`${ip}:${ua}:${lang}`);
  return hash.digest("hex");
}

function checkRateLimit(fingerprint) {
  const now = Date.now();
  const entry = rateLimitHits.get(fingerprint);

  if (rateLimitHits.size > 10000) {
    for (const [key, value] of rateLimitHits.entries()) {
      if (now - value.windowStart > RATE_LIMIT_WINDOW) {
        rateLimitHits.delete(key);
      }
    }
  }

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitHits.set(fingerprint, { windowStart: now, count: 1 });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, reset: Math.ceil(RATE_LIMIT_WINDOW / 1000) };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      remaining: 0,
      reset: Math.ceil((entry.windowStart + RATE_LIMIT_WINDOW - now) / 1000)
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - entry.count,
    reset: Math.ceil((entry.windowStart + RATE_LIMIT_WINDOW - now) / 1000)
  };
}

function isValidApiKey(key) {
  return (
    typeof key === "string" &&
    key.length >= 10 &&
    key.length <= 128 &&
    /^[a-zA-Z0-9_\-]+$/.test(key)
  );
}

export async function GET(request, { params }) {
  return proxyRequest(request, params, "GET");
}

export async function POST(request, { params }) {
  return proxyRequest(request, params, "POST");
}

export async function DELETE(request, { params }) {
  return proxyRequest(request, params, "DELETE");
}

async function proxyRequest(request, params, method) {
  // await params because next15 makes it a promise
  const resolvedParams = await params;
  const path = resolvedParams?.path;

  // fingerprinting & ratelimit check
  const fingerprint = getFingerprint(request);
  const rl = checkRateLimit(fingerprint);

  const rateLimitHeaders = {
    "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
    "X-RateLimit-Remaining": String(rl.remaining),
    "X-RateLimit-Reset": String(rl.reset),
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
  };

  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders,
          "Retry-After": String(rl.reset),
        },
      }
    );
  }

  // resolve and validate target path
  const segments = (path ?? []).filter(Boolean);
  if (segments.length === 0) {
    return NextResponse.json(
      { error: "Invalid path" },
      { status: 400, headers: rateLimitHeaders }
    );
  }

  const rootSegment = segments[0];
  if (!ALLOWED_SEGMENTS.has(rootSegment)) {
    return NextResponse.json(
      { error: "Forbidden path" },
      { status: 403, headers: rateLimitHeaders }
    );
  }

  // reconstruct upstream url safely
  const upstreamPath = segments.map(encodeURIComponent).join("/");
  const upstreamUrl = `${API_BASE}/${upstreamPath}`;

  // validate user api-key if it exists
  const apiKey = request.headers.get("x-api-key");
  const hasApiKey = !!apiKey;

  if (hasApiKey && !isValidApiKey(apiKey)) {
    return NextResponse.json(
      { error: "Invalid x-api-key format" },
      { status: 400, headers: rateLimitHeaders }
    );
  }

  // need master key to bypass limit for drop tier
  const masterKey = process.env.SWIFTMAIL_MASTER_KEY;
  if (hasApiKey && !masterKey) {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503, headers: rateLimitHeaders }
    );
  }

  const headers = {
    "Content-Type": "application/json",
  };

  if (hasApiKey) {
    headers["x-api-key"] = apiKey;
    // inject master key so we act as admin for the user
    headers["x-key"] = masterKey;
  }

  let bodyInit;
  if (method !== "GET" && method !== "HEAD") {
    try {
      const text = await request.text();
      if (text) bodyInit = text;
    } catch {
      // no body is fine
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const upstream = await fetch(upstreamUrl, {
      method,
      headers,
      ...(bodyInit !== undefined ? { body: bodyInit } : {}),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await upstream.json();
    return NextResponse.json(data, {
      status: upstream.status,
      headers: rateLimitHeaders,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      return NextResponse.json(
        { error: "Upstream timeout, please retry" },
        { status: 504, headers: rateLimitHeaders }
      );
    }
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503, headers: rateLimitHeaders }
    );
  }
}
