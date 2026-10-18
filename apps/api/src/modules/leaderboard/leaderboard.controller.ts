import type { FastifyReply, FastifyRequest } from "fastify";
import { handle } from "../../utils/http";
import { LeaderboardService } from "./leaderboard.service";

export class LeaderboardController {
  constructor(private readonly service: LeaderboardService) {
    this.getForEvent = this.getForEvent.bind(this);
  }

  async getForEvent(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    return handle(reply, async () => {
      const leaderboard = await this.service.getLeaderboard(id);
      return { leaderboard };
    });
  }
}
