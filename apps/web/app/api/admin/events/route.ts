import { forward } from "@/lib/api/forward"

export async function GET(request: Request) {
  return forward(request, "/admin/events")
}

export async function POST(request: Request) {
  return forward(request, "/admin/events")
}
