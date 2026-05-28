import { forward } from "@/lib/api/forward"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return forward(request, `/admin/questions/${encodeURIComponent(id)}`)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return forward(request, `/admin/questions/${encodeURIComponent(id)}`)
}
