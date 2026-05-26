/**
 * Returns a trimmed, non-empty `process.env` value. Use only in config files:
 *
 * - `config/server.ts` - server-only vars (`.env`, secrets manager). Import
 *   `serverConfig` in server code; not from client components.
 * - `config/client.ts` - `NEXT_PUBLIC_*` only. Import `clientConfig` in client
 *   code. No secrets - these values are exposed to the browser.
 */

export function requireEnv(name: string): string {
  const raw = process.env[name]?.trim()
  if (!raw) throw new Error(`Missing required environment variable: ${name}`)

  return raw
}
