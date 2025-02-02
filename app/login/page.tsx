"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { supabase } from "../../lib/supabaseClient"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("user_type, correo")
        .eq("correo", email)
        .single()

      if (userError || !userData) {
        setError("Usuario no encontrado")
        return
      }

      localStorage.setItem("userEmail", email)
      localStorage.setItem("userType", userData.user_type)

      console.log("User type saved:", userData.user_type)

      router.push("/dashboard")
    } catch (error) {
      console.error("Error during login:", error)
      setError("Error al iniciar sesión")
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-[#1a1a1a] p-4">
      <Card className="w-full max-w-md bg-[#242424] border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-white">Iniciar Sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#333] text-white border-gray-600"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
              Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

