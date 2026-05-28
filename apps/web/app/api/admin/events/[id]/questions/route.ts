import { forward } from "@/lib/api/forward"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return forward(request, `/admin/events/${encodeURIComponent(id)}/questions`)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return forward(request, `/admin/events/${encodeURIComponent(id)}/questions`)
}
