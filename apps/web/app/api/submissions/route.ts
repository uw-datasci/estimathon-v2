import { forward } from "@/lib/api/forward"

export async function POST(request: Request) {
  return forward(request, "/submissions")
}
