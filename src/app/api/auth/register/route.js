import { handleRegister } from "@/lib/auth-middleware";

export async function POST(request) {
  return handleRegister(request);
}
