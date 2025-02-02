"use client"

import { useEffect, useState } from "react"
import Dashboard from "../dashboard"
import ClientDashboard from "./client-dashboard"
import CoachDashboard from "./coach-dashboard"

export default function DashboardPage() {
  const [userType, setUserType] = useState<string | null>(null)

  useEffect(() => {
    const storedUserType = localStorage.getItem("userType")
    console.log("Current user type:", storedUserType)
    setUserType(storedUserType)
  }, [])

  switch (userType) {
    case "Cliente":
      return <ClientDashboard />
    case "Entrenador":
      return <CoachDashboard />
    case "Administrador":
      return <Dashboard />
    default:
      console.log("No user type match, defaulting to admin dashboard")
      return <Dashboard />
  }
}

