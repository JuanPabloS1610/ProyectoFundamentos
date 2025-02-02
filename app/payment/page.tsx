"use client"

import { useEffect, useState } from "react"
import { CreditCard, Package, User } from "lucide-react"
import { Card, CardContent } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { useRouter } from "next/navigation"
import { QRCodeCanvas } from "qrcode.react"
import { supabase } from "../../lib/supabaseClient"
import { useToast } from "../../components/ui/use-toast"

interface UserData {
  nombre: string
  cedula: string
  correo: string
  membresia: string
}

export default function PaymentForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [showQR, setShowQR] = useState(false)
  const [userType, setUserType] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserData>({
    nombre: "",
    cedula: "",
    correo: "",
    membresia: "",
  })

  useEffect(() => {
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)

    if (storedUserType === "Cliente") {
      const fetchUserData = async () => {
        const userEmail = localStorage.getItem("userEmail")
        if (!userEmail) return

        const { data, error } = await supabase.from("users").select("*").eq("correo", userEmail).single()

        if (error) {
          console.error("Error fetching user data:", error)
          return
        }

        if (data) {
          setUserData({
            nombre: data.nombre,
            cedula: data.cedula,
            correo: data.correo,
            membresia: data.membresia,
          })
        }
      }

      fetchUserData()
    }
  }, [])

  const handleTransferClick = () => {
    router.push("/transfer-details")
  }

  const toggleQR = () => {
    setShowQR(!showQR)
  }

  const searchUser = async (searchCedula: string) => {
    if (!searchCedula) {
      toast({
        title: "Error",
        description: "Por favor, ingrese un número de cédula",
        variant: "destructive",
      })
      return
    }

    const { data, error } = await supabase.from("users").select("*").eq("cedula", searchCedula).single()

    if (error) {
      console.error("Error buscando usuario:", error)
      toast({
        title: "Error",
        description: "No se encontró ningún usuario con esa cédula",
        variant: "destructive",
      })
      return
    }

    if (data) {
      setUserData({
        nombre: data.nombre,
        cedula: data.cedula,
        correo: data.correo,
        membresia: data.membresia,
      })
      toast({
        title: "Éxito",
        description: "Usuario encontrado",
        variant: "success",
      })
    }
  }

  return (
    <div className="flex-1 p-8 bg-[#1a1a1a]">
      <div className="max-w-4xl mx-auto grid grid-cols-2 gap-8">
        <Card className="bg-[#242424] border-0">
          <CardContent className="p-6 space-y-4">
            {userType === "Administrador" && (
              <div className="flex space-x-2">
                <Input
                  placeholder="Ingrese número de cédula"
                  className="bg-[#1a1a1a] border-0 text-white"
                  onChange={(e) => searchUser(e.target.value)}
                />
              </div>
            )}
            <Input
              placeholder="Nombres"
              className="bg-[#9333ea] border-0 text-white placeholder:text-white"
              value={userData.nombre}
              readOnly={userType === "Cliente"}
              onChange={(e) => setUserData({ ...userData, nombre: e.target.value })}
            />
            <Input
              placeholder="Cédula"
              className="bg-[#9333ea] border-0 text-white placeholder:text-white"
              value={userData.cedula}
              readOnly={userType === "Cliente"}
              onChange={(e) => setUserData({ ...userData, cedula: e.target.value })}
            />
            <Input
              placeholder="Correo"
              className="bg-[#9333ea] border-0 text-white placeholder:text-white"
              value={userData.correo}
              readOnly={userType === "Cliente"}
              onChange={(e) => setUserData({ ...userData, correo: e.target.value })}
            />
            <Input
              placeholder="Membresía"
              className="bg-[#9333ea] border-0 text-white placeholder:text-white"
              value={userData.membresia}
              readOnly={userType === "Cliente"}
              onChange={(e) => setUserData({ ...userData, membresia: e.target.value })}
            />

            <div className="flex justify-center mt-8">
              <div className="text-center">
                <div
                  className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-2 cursor-pointer"
                  onClick={toggleQR}
                >
                  <User className="w-6 h-6 text-white" />
                </div>
                <span className="text-white">QR Acceso</span>
              </div>
            </div>

            {showQR && (
              <div className="flex justify-center mt-4">
                <QRCodeCanvas
                  value={`https://example.com/acceso/${userData.cedula}`}
                  size={128}
                  bgColor="#1a1a1a"
                  fgColor="#ffffff"
                />
              </div>
            )}

            <div className="flex justify-center mt-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-2">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <span className="text-white">Cobrar</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h2 className="text-2xl text-white mb-8">Seleccione el método de pago</h2>
          <div className="grid gap-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-4 text-lg h-16 bg-black hover:bg-gray-100"
              onClick={() => router.push("/stripe-payment")}
            >
              <CreditCard className="w-6 h-6" />
              Tarjeta
            </Button>

            {userType === "Administrador" && (
              <Button variant="outline" className="w-full justify-start gap-4 text-lg h-16 bg-black hover:bg-gray-100">
                <Package className="w-6 h-6" />
                Efectivo
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full justify-start gap-4 text-lg h-16 bg-black hover:bg-gray-100"
              onClick={handleTransferClick}
            >
              <Package className="w-6 h-6" />
              Transferencia
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

