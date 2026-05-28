import { forward } from "@/lib/api/forward"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return forward(request, `/events/${encodeURIComponent(id)}/leaderboard`)
}
