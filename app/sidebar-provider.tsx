"use client"

import Sidebar from "./sidebar"
import type React from "react"

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      {children}
    </>
  )
}

