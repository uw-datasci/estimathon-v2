import { forward } from "@/lib/api/forward"

export async function GET(request: Request) {
  return forward(request, "/events/active")
}
