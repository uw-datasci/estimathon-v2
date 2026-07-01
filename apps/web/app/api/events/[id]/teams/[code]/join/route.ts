import { withRaft } from "@uw-datasci/raft"
import { forward } from "@/lib/api/forward"

export const POST = withRaft(async (
  request,
  { params }: { params: Promise<{ id: string; code: string }> }
) => {
  const { id, code } = await params
  return forward(
    request,
    `/events/${encodeURIComponent(id)}/teams/${encodeURIComponent(code)}/join`
  )
})
