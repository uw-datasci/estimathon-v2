import Link from "next/link"
import { Button } from "@estimathon/ui/components/button"

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">You don&apos;t have access</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          This area is restricted to admins. If you think this is a mistake,
          reach out to a club exec.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back to estimathon</Link>
        </Button>
      </div>
    </main>
  )
}
