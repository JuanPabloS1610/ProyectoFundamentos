"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "../../../lib/supabaseClient"

export default function UserForm() {
  const router = useRouter()
  const params = useParams()
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    cedula: "",
    correo: "",
    membresia: "",
    created_at: "",
  })

  useEffect(() => {
    const fetchUser = async () => {
      const userId = params.id
      if (userId && userId !== "create") {
        const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

        if (error) {
          console.error("Error fetching user:", error)
        } else if (data) {
          setFormData(data)
        }
      }
    }

    fetchUser()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (params.id && params.id !== "create") {
      const { error } = await supabase.from("users").update(formData).eq("id", params.id)

      if (error) {
        console.error("Error updating user:", error)
      } else {
        router.push("/users")
      }
    } else {
      const { error } = await supabase.from("users").insert([formData])

      if (error) {
        console.error("Error creating user:", error)
      } else {
        router.push("/users")
      }
    }
  }

  const isEditing = params.id && params.id !== "create"

  return (
    <div className="flex-1 p-8 bg-[#1a1a1a] min-h-screen">
      <Card className="max-w-2xl mx-auto bg-[#242424] border-0">
        <CardHeader>
          <CardTitle className="text-white">{isEditing ? "EDITAR USUARIO" : "CREAR USUARIO"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-green-500 block mb-1">Nombre</label>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="bg-white text-black"
                required
              />
            </div>
            <div>
              <label className="text-blue-500 block mb-1">Cedula</label>
              <Input
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                className="bg-white text-black"
                required
              />
            </div>
            <div>
              <label className="text-green-500 block mb-1">Correo electrónico</label>
              <Input
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                className="bg-white text-black"
                type="email"
                required
              />
            </div>
            <div>
              <label className="text-green-500 block mb-1">Membresia</label>
              <Input
                value={formData.membresia}
                onChange={(e) => setFormData({ ...formData, membresia: e.target.value })}
                className="bg-white text-black"
                required
              />
            </div>
            <div>
              <label className="text-green-500 block mb-1">Generar QR de acceso</label>
              <Button className="bg-white text-black hover:bg-gray-100">Generar</Button>
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1 bg-green-500 hover:bg-green-600">
                {isEditing ? "Actualizar" : "Crear"}
              </Button>
              <Button
                type="button"
                onClick={() => router.push("/users")}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                Volver
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

