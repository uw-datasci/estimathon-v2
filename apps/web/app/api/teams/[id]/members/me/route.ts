import { forward } from "@/lib/api/forward"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return forward(request, `/teams/${encodeURIComponent(id)}/members/me`)
}
