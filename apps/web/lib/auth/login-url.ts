import { clientConfig } from "@/config/client";

/**
 * `returnTo` is a path on this site. Defaults to the landing page, which
 * self-routes signed-in users to the right game screen.
 */
export function buildLoginUrl(returnTo = "/"): string {
  const loginUrl = new URL("/login", clientConfig.mainSiteUrl);
  loginUrl.searchParams.set("redirect", new URL(returnTo, clientConfig.mainSiteUrl).toString());
  return loginUrl.toString();
}
