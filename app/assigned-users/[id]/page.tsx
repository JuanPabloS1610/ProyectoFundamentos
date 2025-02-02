"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { User } from "lucide-react"
import { supabase } from "../../../lib/supabaseClient"
import { useParams, useRouter } from "next/navigation"

interface UserDetails {
  id: string
  nombre: string
  cedula: string
  correo: string
  membresia: string
  routines?: {
    id: string
    name: string
  }[]
}

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const [user, setUser] = useState<UserDetails | null>(null)

  useEffect(() => {
    const fetchUserDetails = async () => {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select(`
          id,
          nombre,
          cedula,
          correo,
          membresia,
          assigned_routines (
            routine_id,
            routines (
              id,
              name
            )
          )
        `)
        .eq("id", userId)
        .single()

      if (userError) {
        console.error("Error fetching user details:", userError)
        return
      }

      if (userData) {
        const routines = userData.assigned_routines?.map((ar: any) => ({
          id: ar.routines.id,
          name: ar.routines.name,
        }))

        setUser({
          id: userData.id,
          nombre: userData.nombre,
          cedula: userData.cedula,
          correo: userData.correo,
          membresia: userData.membresia,
          routines: routines || [],
        })
      }
    }

    if (userId) {
      fetchUserDetails()
    }
  }, [userId])

  if (!user) return null

  return (
    <div className="flex-1 min-h-screen bg-[#1a1a1a] p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-[#242424] border-0">
          <CardHeader>
            <CardTitle className="text-white">Datos Personales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 bg-purple-600 rounded-full flex items-center justify-center">
                <User className="w-16 h-16 text-white" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="bg-purple-600 text-white px-4 py-2 rounded-t-lg">Nombre</div>
                <div className="bg-[#1a1a1a] text-white px-4 py-2 rounded-b-lg">{user.nombre}</div>
              </div>

              <div>
                <div className="bg-purple-600 text-white px-4 py-2 rounded-t-lg">Cedula</div>
                <div className="bg-[#1a1a1a] text-white px-4 py-2 rounded-b-lg">{user.cedula}</div>
              </div>

              <div>
                <div className="bg-purple-600 text-white px-4 py-2 rounded-t-lg">Correo</div>
                <div className="bg-[#1a1a1a] text-white px-4 py-2 rounded-b-lg">{user.correo}</div>
              </div>

              <div>
                <div className="bg-purple-600 text-white px-4 py-2 rounded-t-lg">Membresia</div>
                <div className="bg-[#1a1a1a] text-white px-4 py-2 rounded-b-lg">{user.membresia}</div>
              </div>
            </div>
          </CardContent>
        </Card>

¿        <Card className="bg-[#242424] border-0">
          <CardHeader>
            <CardTitle className="text-white">Rutinas de entrenamiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.routines && user.routines.length > 0 ? (
                user.routines.map((routine) => (
                  <div key={routine.id} className="bg-[#1a1a1a] p-4 rounded-lg">
                    <p className="text-white mb-4">{routine.name}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="bg-gray-700 text-white hover:bg-gray-600"
                        onClick={() => router.push(`/assigned-users/${user.id}/routines`)}
                      >
                        Ver rutinas
                      </Button>
                      <Button variant="destructive">Eliminar rutina</Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No hay rutinas asignadas</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

