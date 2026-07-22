import { withRaft } from "@uw-datasci/raft";
import { forward } from "@/lib/api/forward";

export const POST = withRaft(async (request) => {
  return forward(request, "/submissions");
});
