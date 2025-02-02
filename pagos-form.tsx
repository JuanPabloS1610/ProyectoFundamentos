'use client'

import { CreditCard, Home, Package, Settings, User, Users } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function PaymentForm() {
  return (
    <div className="flex min-h-screen bg-[#1a1a1a]">
      {/* Sidebar */}
      <div className="w-20 bg-[#1a1a1a] border-r border-gray-800 flex flex-col items-center py-6 gap-8">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-green-500" />
        <nav className="flex flex-col gap-6">
          <Button variant="ghost" size="icon" className="text-gray-400">
            <Home className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400">
            <User className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400">
            <Package className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400">
            <Users className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400">
            <Settings className="h-6 w-6" />
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-8">
          {/* Form Section */}
          <Card className="bg-[#242424] border-0">
            <CardContent className="p-6 space-y-4">
              <Input 
                placeholder="Ingrese numero de cedula"
                className="bg-[#1a1a1a] border-0 text-white"
              />
              <Input 
                placeholder="Nombres"
                className="bg-[#9333ea] border-0 text-white placeholder:text-white"
              />
              <Input 
                placeholder="Cedula"
                className="bg-[#9333ea] border-0 text-white placeholder:text-white"
              />
              <Input 
                placeholder="Correo"
                className="bg-[#9333ea] border-0 text-white placeholder:text-white"
              />
              <Input 
                placeholder="Membresia"
                className="bg-[#9333ea] border-0 text-white placeholder:text-white"
              />
              
              <div className="flex items-center justify-between mt-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white">QR Acceso</span>
                </div>
                <Image 
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-z7WqGN5fW8ZNzxRfdtxiYMnucc2Mbo.png"
                  alt="QR Code"
                  width={100}
                  height={100}
                  className="rounded-lg"
                />
              </div>

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

          {/* Payment Methods Section */}
          <div className="space-y-6">
            <h2 className="text-2xl text-white mb-8">Seleccione el metodo de pago</h2>
            <div className="grid gap-4">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-4 text-lg h-16 bg-white hover:bg-gray-100"
              >
                <CreditCard className="w-6 h-6" />
                Tarjeta
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-4 text-lg h-16 bg-white hover:bg-gray-100"
              >
                <Package className="w-6 h-6" />
                Efectivo
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-4 text-lg h-16 bg-white hover:bg-gray-100"
              >
                <Package className="w-6 h-6" />
                Transferencia
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

