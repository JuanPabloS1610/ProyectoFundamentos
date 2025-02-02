"use client"

import { useEffect, useState } from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent } from "../../../components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "../../../lib/supabaseClient"
import { useToast } from "../../../components/ui/use-toast"

interface Membership {
  id: string
  name: string
  services: string[]
  price: number
}

interface UserData {
  nombre: string
  cedula: string
  correo: string
}

export default function MembershipSelection() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchMemberships = async () => {
      const { data, error } = await supabase.from("memberships").select("*")
      if (error) {
        console.error("Error fetching memberships:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las membresías. Por favor, recargue la página.",
          variant: "destructive",
        })
      } else {
        setMemberships(data || [])
      }
    }

    const nombre = searchParams.get("nombre")
    const cedula = searchParams.get("cedula")
    const correo = searchParams.get("correo")

    if (nombre && cedula && correo) {
      setUserData({ nombre, cedula, correo })
    } else {
      router.push("/users/create")
    }

    fetchMemberships()
  }, [searchParams, router, toast])

  const handleAssignMembership = async () => {
    if (!selectedMembership || !userData) return

    setIsLoading(true)

    const { data, error } = await supabase.from("users").insert([
      {
        nombre: userData.nombre,
        cedula: userData.cedula,
        correo: userData.correo,
        membership_id: selectedMembership.id,
        membresia: selectedMembership.name,
        user_type: searchParams.get("user_type") || "Cliente",
      },
    ])

    setIsLoading(false)

    if (error) {
      console.error("Error creating user:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el usuario. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      })
    } else {
      console.log("User created successfully:", data)
      toast({
        title: "Éxito",
        description: "Usuario creado exitosamente con la membresía asignada.",
        variant: "success",
      })
      router.push("/users")
    }
  }

  return (
    <div className="flex-1 min-h-screen bg-[#1a1a1a] p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-[#9333ea] p-4 rounded-md">
            <h3 className="text-white font-bold mb-2">Nombres</h3>
            <p className="text-white/90">{userData?.nombre}</p>
          </div>
          <div className="bg-[#9333ea] p-4 rounded-md">
            <h3 className="text-white font-bold mb-2">Cedula</h3>
            <p className="text-white/90">{userData?.cedula}</p>
          </div>
          <div className="bg-[#9333ea] p-4 rounded-md">
            <h3 className="text-white font-bold mb-2">Correo</h3>
            <p className="text-white/90">{userData?.correo}</p>
          </div>
          <div className="mt-8">
            <div className="w-32 h-32 bg-[#242424] rounded-lg flex items-center justify-center">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-W4to0M4P24PUY0fWj3Bk5lc3kRjvaz.png"
                alt="QR Code"
                className="w-24 h-24"
              />
            </div>
            <p className="text-white mt-2">QR Acceso</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl text-white mb-8">Seleccione Tipo de membresía</h2>
          <div className="space-y-6">
            {memberships.map((membership) => (
              <Card
                key={membership.id}
                className={`bg-[#242424] border-2 cursor-pointer transition-colors ${
                  selectedMembership?.id === membership.id
                    ? "border-green-500"
                    : "border-transparent hover:border-gray-700"
                }`}
                onClick={() => setSelectedMembership(membership)}
              >
                <CardContent className="p-6">
                  <div className="bg-yellow-500 text-black font-bold text-xl p-2 mb-4 inline-block">
                    {membership.name}
                  </div>
                  <div className="space-y-2 text-white mb-4">
                    {membership.services.map((service, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-green-500">•</span>
                        {service}
                      </div>
                    ))}
                  </div>
                  <div className="bg-yellow-500 text-black font-bold p-2 text-center">${membership.price} al mes</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button
            onClick={handleAssignMembership}
            disabled={!selectedMembership || isLoading}
            className="w-full bg-green-500 hover:bg-green-600 mt-6"
          >
            {isLoading ? "Creando usuario..." : "Asignar Membresía"}
          </Button>
        </div>
      </div>
    </div>
  )
}

