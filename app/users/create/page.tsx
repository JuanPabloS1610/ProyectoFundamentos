"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Label } from "../../../components/ui/label"
import { supabase } from "../../../lib/supabaseClient"

export default function CreateUser() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: "",
    cedula: "",
    correo: "",
    user_type: "Cliente",
    specialties: "",
    philosophy: "",
  })
  const [error, setError] = useState("")

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateEmail(formData.correo)) {
      setError("Por favor ingrese un correo electrónico válido")
      return
    }

    try {
      if (formData.user_type === "Cliente") {
        const params = new URLSearchParams({
          nombre: formData.nombre,
          cedula: formData.cedula,
          correo: formData.correo,
          user_type: formData.user_type,
        })
        router.push(`/users/membership-selection?${params.toString()}`)
      } else {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .insert([
            {
              nombre: formData.nombre,
              cedula: formData.cedula,
              correo: formData.correo,
              user_type: formData.user_type,
            },
          ])
          .select()

        if (userError) {
          if (userError.code === "23505") {
            setError("Este correo electrónico ya está registrado")
            return
          }
          throw userError
        }

        if (formData.user_type === "Entrenador" && userData) {
          const { error: coachError } = await supabase.from("coaches").insert([
            {
              user_id: userData[0].id,
              specialties: formData.specialties.split(",").map((s) => s.trim()),
              philosophy: formData.philosophy,
            },
          ])

          if (coachError) throw coachError
        }

        router.push("/users")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      setError("Ocurrió un error al crear el usuario. Por favor intente nuevamente.")
    }
  }

  return (
    <div className="flex-1 p-8 bg-[#1a1a1a] min-h-screen">
      <Card className="max-w-2xl mx-auto bg-[#242424] border-0">
        <CardHeader>
          <CardTitle className="text-white">CREAR USUARIO</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nombre" className="text-green-500">
                Nombre
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="bg-[#333] text-white border-gray-600"
                required
              />
            </div>

            <div>
              <Label htmlFor="cedula" className="text-blue-500">
                Cedula
              </Label>
              <Input
                id="cedula"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                className="bg-[#333] text-white border-gray-600"
                required
              />
            </div>

            <div>
              <Label htmlFor="correo" className="text-green-500">
                Correo electrónico
              </Label>
              <Input
                id="correo"
                value={formData.correo}
                onChange={(e) => {
                  setFormData({ ...formData, correo: e.target.value })
                  setError("") 
                }}
                className="bg-[#333] text-white border-gray-600"
                type="email"
                required
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <div>
              <Label htmlFor="user-type" className="text-purple-500">
                Tipo de Usuario
              </Label>
              <Select
                value={formData.user_type}
                onValueChange={(value) => setFormData({ ...formData, user_type: value })}
              >
                <SelectTrigger id="user-type" className="bg-[#333] text-white border-gray-600">
                  <SelectValue placeholder="Seleccione el tipo de usuario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Entrenador">Entrenador</SelectItem>
                  <SelectItem value="Cliente">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.user_type === "Entrenador" && (
              <>
                <div>
                  <Label htmlFor="specialties" className="text-yellow-500">
                    Especialidades
                  </Label>
                  <Input
                    id="specialties"
                    value={formData.specialties}
                    onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                    className="bg-[#333] text-white border-gray-600"
                    placeholder="Separadas por comas"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="philosophy" className="text-pink-500">
                    Filosofía de entrenamiento
                  </Label>
                  <Textarea
                    id="philosophy"
                    value={formData.philosophy}
                    onChange={(e) => setFormData({ ...formData, philosophy: e.target.value })}
                    className="bg-[#333] text-white border-gray-600"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1 bg-green-500 hover:bg-green-600">
                {formData.user_type === "Cliente" ? "Siguiente" : "Crear Usuario"}
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

