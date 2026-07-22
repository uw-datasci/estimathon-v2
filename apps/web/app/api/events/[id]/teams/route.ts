import { withRaft } from "@uw-datasci/raft";
import { forward } from "@/lib/api/forward";

export const POST = withRaft(
  async (request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    return forward(request, `/events/${encodeURIComponent(id)}/teams`);
  }
);
