import "server-only"

import { requireEnv } from "@/lib/utils/env"

export const serverConfig = {
  databaseUrl: requireEnv("API_URL"),
} as const
