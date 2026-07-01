import { withRaft } from "@uw-datasci/raft"
import { forward } from "@/lib/api/forward"

export const PATCH = withRaft(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  return forward(request, `/admin/questions/${encodeURIComponent(id)}`)
})

export const DELETE = withRaft(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  return forward(request, `/admin/questions/${encodeURIComponent(id)}`)
})
