"use client"

import { Link, Upload, CreditCard, Package } from "lucide-react"
import { Button } from "../components/ui/button"
import { useToast } from "../components/ui/use-toast"
import { useState, useRef } from "react"
import { supabase } from "../lib/supabaseClient"
import { useRouter } from "next/navigation"
import type React from "react" // Added import for React

export default function TransferDetails() {
  const { toast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validTypes = ["image/png", "application/pdf"]
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Solo se permiten archivos PNG o PDF.",
      })
      return
    }

    setIsUploading(true)

    try {
      // Simulate file upload
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setUploadedFile(file)
      toast({
        variant: "success",
        title: "¡Éxito!",
        description: "El archivo se subió exitosamente.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El archivo no se pudo subir correctamente. Inténtelo de nuevo.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleUploadClick = async () => {
    if (uploadedFile) {
      try {
        // Get user data
        const userEmail = localStorage.getItem("userEmail")
        const { data: userData } = await supabase
          .from("users")
          .select("id, nombre, cedula")
          .eq("correo", userEmail)
          .single()

        if (userData) {
          // Record payment in database
          const { data: paymentData, error: paymentError } = await supabase
            .from("payments")
            .insert({
              payment_id: `TRANSFER-${Date.now()}`,
              user_id: userData.id,
              identification: userData.cedula,
              customer_name: userData.nombre,
              status: "pending",
              amount: 60, // Assuming a fixed amount, adjust as needed
              payment_method: "transfer",
            })
            .select()
            .single()

          if (paymentError) {
            throw paymentError
          }

          toast({
            variant: "success",
            title: "¡Enviado!",
            description: "El comprobante ha sido enviado exitosamente.",
          })

          // Redirect to a confirmation page or dashboard
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Error recording payment:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Hubo un problema al procesar el pago. Por favor, inténtelo de nuevo.",
        })
      }
    } else {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="flex min-h-screen bg-[#1a1a1a]">
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl text-white mb-8">Seleccione el metodo de pago</h2>

          <div className="grid gap-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-4 text-lg h-16 bg-black hover:bg-gray-100"
              onClick={() => router.push("/stripe-payment")}
            >
              <CreditCard className="w-6 h-6" />
              Tarjeta
            </Button>
            <Button variant="outline" className="w-full justify-start gap-4 text-lg h-16 bg-black hover:bg-gray-100">
              <Package className="w-6 h-6" />
              Efectivo
            </Button>
            <Button variant="outline" className="w-full justify-start gap-4 text-lg h-16 bg-black hover:bg-gray-100">
              <Package className="w-6 h-6" />
              Transferencia
            </Button>
          </div>

          {/* Rest of the component remains unchanged */}

          <input type="file" ref={fileInputRef} className="hidden" accept=".png,.pdf" onChange={handleFileUpload} />

          {uploadedFile && (
            <div className="text-white bg-gray-700 p-2 rounded-md flex items-center justify-between">
              <span>{uploadedFile.name}</span>
              <button onClick={() => setUploadedFile(null)} className="text-red-500 hover:text-red-700">
                X
              </button>
            </div>
          )}

          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white text-lg h-12 mt-4"
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : uploadedFile ? (
              <>
                <Link className="w-4 h-4 mr-2" />
                ENVIAR
              </>
            ) : (
              <>
                <Link className="w-4 h-4 mr-2" />
                SUBIR COMPROBANTE
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

