import { headers } from "next/headers"
import { clientConfig } from "@/config/client"

export async function buildLoginHref(): Promise<string> {
  const headerList = await headers()
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host")
  const proto = headerList.get("x-forwarded-proto") ?? "http"
  const returnTo = host ? `${proto}://${host}/` : "/"
  return `${clientConfig.mainSiteUrl}/login?redirect=${encodeURIComponent(returnTo)}`
}
