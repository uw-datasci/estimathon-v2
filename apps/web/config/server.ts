import "server-only";

type ServerConfig = {
  readonly supabaseUrl: string;
  readonly supabasePublishableKey: string;
};

/**
 * Returns a trimmed, non-empty `process.env` value. Use in `config/client.ts`,
 * `config/server.ts`, or other config modules - not scattered across the app.
 */
function requireEnv(name: string): string {
  const raw = process.env[name]?.trim();
  if (!raw) throw new Error(`Missing required environment variable: ${name}`);

  return raw;
}

/**
 * Server-only config (no `NEXT_PUBLIC_` prefix). Use in Route Handlers, Server
 * Components, and middleware - never in Client Components.
 */
export const serverConfig: ServerConfig = {
  get supabaseUrl() {
    return requireEnv("SUPABASE_URL");
  },
  get supabasePublishableKey() {
    return requireEnv("SUPABASE_PUBLISHABLE_KEY");
  },
};
