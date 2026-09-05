import { NextResponse } from "next/server";

const API_BASE = "https://api.swiftinbox.xyz";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const apiKey = body.api_key;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing api_key" }, { status: 400 });
  }

  if (
    typeof apiKey !== "string" ||
    apiKey.length < 10 ||
    apiKey.length > 128 ||
    !/^[a-zA-Z0-9_\-]+$/.test(apiKey)
  ) {
    return NextResponse.json({ error: "Invalid api_key format" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${API_BASE}/me`, {
      headers: { "x-api-key": apiKey },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    if (err.name === "AbortError") {
      return NextResponse.json({ error: "Upstream timeout" }, { status: 504 });
    }
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}
