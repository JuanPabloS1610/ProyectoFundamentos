"use client"

import { usePathname } from "next/navigation"
import { SidebarProvider } from "./sidebar-provider"
import type React from "react"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === "/login") {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <div className="flex min-h-screen">
      <SidebarProvider>
        <div className="flex-1 pl-24">{children}</div>
      </SidebarProvider>
    </div>
  )
}

