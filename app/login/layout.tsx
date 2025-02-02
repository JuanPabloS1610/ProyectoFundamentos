"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useToast } from "../../components/ui/use-toast"
import { supabase } from "../../lib/supabaseClient"

const LoginPage: React.FC = () => {
  const router = useRouter()
  const { toast } = useToast()
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (credentials.email === "admin@gmail.com" && credentials.password === "admin123") {
      localStorage.setItem("userType", "Administrador")
      localStorage.setItem("userEmail", credentials.email)
      router.push("/dashboard")
      return
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("correo", credentials.email)
      .eq("cedula", credentials.password)
      .single()

    if (error || !data) {
      toast({
        title: "Error",
        description: "Credenciales inválidas",
        variant: "destructive",
      })
      return
    }

    localStorage.setItem("userType", data.user_type)
    localStorage.setItem("userEmail", data.correo)
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Inicio De Sesión</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo</label>
            <Input
              type="email"
              required
              className="mt-1 block w-full text-gray-900 bg-gray-50 border-gray-300"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <Input
              type="password"
              required
              className="mt-1 block w-full text-gray-900 bg-gray-50 border-gray-300"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
            Iniciar Sesión
          </Button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage

