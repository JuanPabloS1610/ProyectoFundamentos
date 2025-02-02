"use client"

import { Button } from "../../components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"

interface User {
  id: string
  nombre: string
  cedula: string
  correo: string
  membresia: string
  created_at: string
}

export default function Users() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*")

    if (error) {
      console.error("Error fetching users:", error)
    } else {
      setUsers(data || [])
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("users").delete().eq("id", id)

    if (error) {
      console.error("Error deleting user:", error)
    } else {
      fetchUsers()
    }
  }

  return (
    <div className="flex-1 p-8 bg-[#1a1a1a] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Consultar Usuarios</h1>
          <Button onClick={() => router.push("/users/create")} className="bg-[#9333ea] hover:bg-[#7928ca]">
            Nuevo Usuario
          </Button>
        </div>

        <div className="bg-[#242424] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#9333ea] text-white">
                <th className="px-6 py-3 text-left">Nombre</th>
                <th className="px-6 py-3 text-left">Cedula</th>
                <th className="px-6 py-3 text-left">Correo</th>
                <th className="px-6 py-3 text-left">Membresia</th>
                <th className="px-6 py-3 text-left">QR</th>
                <th className="px-6 py-3 text-left">Editar</th>
                <th className="px-6 py-3 text-left">Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-700 text-white">
                  <td className="px-6 py-4">{user.nombre}</td>
                  <td className="px-6 py-4">{user.cedula}</td>
                  <td className="px-6 py-4">{user.correo}</td>
                  <td className="px-6 py-4">{user.membresia}</td>
                  <td className="px-6 py-4">
                    <Button variant="outline" size="sm">
                      Ver QR
                    </Button>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600"
                      onClick={() => router.push(`/users/${user.id}`)}
                    >
                      Editar
                    </Button>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-red-500 hover:bg-red-600"
                      onClick={() => handleDelete(user.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

