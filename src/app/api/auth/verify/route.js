import { handleVerify } from "@/lib/auth-middleware";

export async function POST(request) {
  return handleVerify(request);
}
