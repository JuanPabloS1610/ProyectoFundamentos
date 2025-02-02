"use client"

import { useEffect, useState } from "react"
import { Bookmark } from "lucide-react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import ClientRoutinesView from "./client-routines-view"

export default function RoutinesPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<string | null>(null)

  useEffect(() => {
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)
  }, [])

  const handleSelect = (value: string) => {
    switch (value) {
      case "create":
        router.push("/routines/create")
        break
      case "templates":
        router.push("/routines/templates")
        break
      case "assigned":
        router.push("/routines/assigned")
        break
    }
  }

  if (userType === "Cliente") {
    return <ClientRoutinesView />
  }

  return (
    <div className="flex-1 min-h-screen bg-[#1a1a1a] flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-32 h-32 bg-[#9333ea] rounded-lg flex items-center justify-center">
            <Bookmark className="w-16 h-16 text-white" />
          </div>
        </div>

        <Select onValueChange={handleSelect}>
          <SelectTrigger className="w-[280px] bg-[#242424] border-0 text-white">
            <SelectValue placeholder="Administrador de rutinas" />
          </SelectTrigger>
          <SelectContent className="bg-[#242424] border-gray-800">
            <SelectItem value="create" className="text-white hover:bg-[#333]">
              Crear Rutina
            </SelectItem>
            <SelectItem value="templates" className="text-white hover:bg-[#333]">
              Ver Plantillas
            </SelectItem>
            {userType === "Administrador" && (
              <SelectItem value="assigned" className="text-white hover:bg-[#333]">
                Ver Rutinas Asignadas
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

