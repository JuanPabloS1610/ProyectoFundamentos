"use client"

import { Home, Settings, Dumbbell, LogOut, Package, BarChart3, CreditCard, User, Receipt } from "lucide-react"
import { Button } from "../components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [userInitial, setUserInitial] = useState("")
  const [userType, setUserType] = useState<string | null>(null)

  useEffect(() => {
    const email = localStorage.getItem("userEmail") || ""
    const type = localStorage.getItem("userType")
    setUserInitial(email.charAt(0).toUpperCase())
    setUserType(type)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("userType")
    localStorage.removeItem("userEmail")
    router.push("/login")
  }

  const isActive = (path: string) => pathname === path

  // Hide sidebar on login page
  if (pathname === "/login") {
    return null
  }

  return (
    <div className="w-20 bg-[#1a1a1a] border-r border-gray-800 flex flex-col items-center py-6 fixed h-full">
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-green-500 flex items-center justify-center mb-6">
        <span className="text-white font-bold">{userInitial}</span>
      </div>
      {userType === "Cliente" && (
        <nav className="flex flex-col gap-6 items-center flex-1">
          <Button
            variant="ghost"
            size="icon"
            className={`text-gray-400 ${isActive("/dashboard") ? "bg-[#9333ea] text-white" : ""}`}
            onClick={() => router.push("/dashboard")}
          >
            <Home className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`text-gray-400 ${isActive("/profile") ? "bg-[#9333ea] text-white" : ""}`}
            onClick={() => router.push("/profile")}
          >
            <User className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`text-gray-400 ${isActive("/settings") ? "bg-[#9333ea] text-white" : ""}`}
            onClick={() => router.push("/settings")}
          >
            <Settings className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`text-gray-400 ${isActive("/routines") ? "bg-[#9333ea] text-white" : ""}`}
            onClick={() => router.push("/routines")}
          >
            <Dumbbell className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`text-gray-400 ${isActive("/payment") ? "bg-[#9333ea] text-white" : ""}`}
            onClick={() => router.push("/payment")}
          >
            <CreditCard className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 mt-auto mb-6" onClick={handleLogout}>
            <LogOut className="h-6 w-6" />
          </Button>
        </nav>
      )}
      {userType === "Administrador" && (
        <nav className="flex flex-col gap-6 items-center flex-1">
          <Button
            variant="ghost"
            size="icon"
            className={`text-gray-400 ${isActive("/") ? "bg-[#9333ea] text-white" : ""}`}
            onClick={() => router.push("/")}
          >
            <Home className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`text-gray-400 ${isActive("/admin") ? "bg-[#9333ea] text-white" : ""}`}
            onClick={() => router.push("/admin")}
          >
            <BarChart3 className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`text-gray-400 ${isActive("/payment") ? "bg-[#9333ea] text-white" : ""}`}
            onClick={() => router.push("/payment")}
          >
            <Package className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`text-gray-400 ${isActive("/routines") ? "bg-[#9333ea] text-white" : ""}`}
            onClick={() => router.push("/routines")}
          >
            <Dumbbell className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`text-gray-400 ${isActive("/formulario") ? "bg-[#9333ea] text-white" : ""}`}
            onClick={() => router.push("/formulario")}
          >
            <Receipt className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 mt-auto" onClick={handleLogout}>
            <LogOut className="h-6 w-6" />
          </Button>
        </nav>
      )}
      {userType === "Entrenador" && (
        <nav className="flex flex-col gap-6 items-center flex-1">
          <Button
            variant="ghost"
            size="icon"
            className={`text-gray-400 ${isActive("/dashboard") ? "bg-[#9333ea] text-white" : ""}`}
            onClick={() => router.push("/dashboard")}
          >
            <Home className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`text-gray-400 ${isActive("/settings") ? "bg-[#9333ea] text-white" : ""}`}
            onClick={() => router.push("/settings")}
          >
            <Settings className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`text-gray-400 ${isActive("/routines") ? "bg-[#9333ea] text-white" : ""}`}
            onClick={() => router.push("/routines")}
          >
            <Dumbbell className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`text-gray-400 ${isActive("/assigned-users") ? "bg-[#9333ea] text-white" : ""}`}
            onClick={() => router.push("/assigned-users")}
          >
            <User className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 mt-auto mb-6" onClick={handleLogout}>
            <LogOut className="h-6 w-6" />
          </Button>
        </nav>
      )}
    </div>
  )
}

