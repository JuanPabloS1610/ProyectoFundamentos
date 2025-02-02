"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Switch } from "../../components/ui/switch"
import { ChevronRight } from "lucide-react"
import { supabase } from "../../lib/supabaseClient"

interface User {
  id: string
  nombre: string
  foto_url?: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const userEmail = localStorage.getItem("userEmail")
      if (!userEmail) return

      const { data } = await supabase.from("users").select("id, nombre, foto_url").eq("correo", userEmail).single()

      if (data) {
        setUser(data)
      }
    }

    fetchUser()
  }, [])

  return (
    <div className="flex-1 min-h-screen bg-[#1a1a1a] p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">AJUSTES</h1>

        <div className="bg-[#00FF00] p-8 rounded-lg mb-8 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-[#242424] mb-4 overflow-hidden">
            {user?.foto_url ? (
              <img src={user.foto_url || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-4xl">
                {user?.nombre?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold text-black">{user?.nombre}</h2>
        </div>

        <Card className="bg-[#242424] border-0 mb-4">
          <CardContent className="p-4">
            <h3 className="text-white mb-4">Cuenta</h3>
            <Button
              variant="ghost"
              className="w-full justify-between text-white hover:bg-[#333] mb-2"
              onClick={() => router.push("/settings/profile")}
            >
              Editar Perfil
              <ChevronRight className="h-5 w-5" />
            </Button>
            <div className="flex items-center justify-between text-white">
              <span>Notificaciones</span>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
                className="data-[state=checked]:bg-purple-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#242424] border-0">
          <CardContent className="p-4">
            <h3 className="text-white mb-4">Sobre Nosotros</h3>
            <Button
              variant="ghost"
              className="w-full justify-between text-white hover:bg-[#333] mb-2"
              onClick={() => {}}
            >
              Ayuda & Soporte
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button variant="ghost" className="w-full justify-between text-white hover:bg-[#333]" onClick={() => {}}>
              Términos y Condiciones
              <ChevronRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

