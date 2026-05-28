import { forward } from "@/lib/api/forward"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; code: string }> }
) {
  const { id, code } = await params
  return forward(
    request,
    `/events/${encodeURIComponent(id)}/teams/${encodeURIComponent(code)}/join`
  )
}
