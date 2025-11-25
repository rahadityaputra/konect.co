import type React from "react"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex flex-col">
      <div className="p-4 sm:p-6">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-lg">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            K
          </div>
          <span className="hidden sm:inline">Konect.co</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">{children}</div>
    </div>
  )
}
