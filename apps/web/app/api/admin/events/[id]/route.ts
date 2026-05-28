import { forward } from "@/lib/api/forward"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return forward(request, `/admin/events/${encodeURIComponent(id)}`)
}
