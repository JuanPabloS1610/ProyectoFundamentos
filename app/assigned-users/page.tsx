"use client"

import { useEffect, useState } from "react"
import { Card } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Pencil } from "lucide-react"
import { supabase } from "../../lib/supabaseClient"
import { useRouter } from "next/navigation"

interface AssignedUser {
  id: string
  nombre: string
  membresia: string
  created_at: string
}

interface UserData {
  id: string
  coaches:
    | {
        id: string
      }[]
    | null
}

interface AssignedCoachData {
  user_id: string
  users: {
    id: string
    nombre: string
    membresia: string
    created_at: string
  }
}

export default function AssignedUsersPage() {
  const [users, setUsers] = useState<AssignedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchAssignedUsers = async () => {
      const userEmail = localStorage.getItem("userEmail")
      if (!userEmail) {
        setError("No user email found")
        setLoading(false)
        return
      }

      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select(`
            id,
            coaches (
              id
            )
          `)
          .eq("correo", userEmail)
          .single()

        if (userError) throw userError

        const typedUserData = userData as UserData
        if (!typedUserData?.coaches?.[0]?.id) throw new Error("No coach ID found")

        const coachId = typedUserData.coaches[0].id

        const { data: assignedUsers, error: assignedError } = await supabase
          .from("assigned_coaches")
          .select(`
            user_id,
            users (
              id,
              nombre,
              membresia,
              created_at
            )
          `)
          .eq("coach_id", coachId)

        if (assignedError) throw assignedError

        if (assignedUsers) {
          const formattedUsers: AssignedUser[] = assignedUsers.map((assignment: any) => ({
            id: assignment.users.id,
            nombre: assignment.users.nombre,
            membresia: assignment.users.membresia,
            created_at: assignment.users.created_at,
          }))
          setUsers(formattedUsers)
        }
      } catch (error) {
        console.error("Error in fetchAssignedUsers:", error)
        setError(error instanceof Error ? error.message : String(error))
      } finally {
        setLoading(false)
      }
    }

    fetchAssignedUsers()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-[#1a1a1a] p-8 ml-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Cargando usuarios asignados...</h1>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 min-h-screen bg-[#1a1a1a] p-8 ml-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Error al cargar usuarios asignados</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-screen bg-[#1a1a1a] p-8 ml-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Usuarios Asignados</h1>

        <Card className="bg-[#242424] border-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Info</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-sm text-gray-300 text-center">
                      No hay usuarios asignados
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-700">
                      <td className="px-4 py-4 text-sm text-gray-300">{user.id}</td>
                      <td className="px-4 py-4 text-sm text-gray-300">{user.nombre}</td>
                      <td className="px-4 py-4 text-sm text-gray-300">
                        <div className="space-y-1">
                          <p>Inicio: {new Date(user.created_at).toLocaleDateString()}</p>
                          <p>Tipo de membresía: {user.membresia}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-500"
                          onClick={() => router.push(`/assigned-users/${user.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

