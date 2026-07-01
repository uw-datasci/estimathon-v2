import { withRaft } from "@uw-datasci/raft"
import { forward } from "@/lib/api/forward"

export const DELETE = withRaft(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  return forward(request, `/teams/${encodeURIComponent(id)}/members/me`)
})
