import { handleLogin } from "@/lib/auth-middleware";

export async function POST(request) {
  return handleLogin(request);
}
