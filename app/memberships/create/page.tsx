"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabaseClient"

export default function CreateMembership() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    services: "",
    price: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const services = formData.services.split("\n").filter((service) => service.trim() !== "")

    const { data, error } = await supabase.from("memberships").insert([
      {
        name: formData.name,
        services: services,
        price: Number.parseFloat(formData.price),
      },
    ])

    if (error) {
      console.error("Error creating membership:", error)
    } else {
      console.log("Membership created successfully:", data)
      router.push("/memberships")
    }
  }

  return (
    <div className="flex-1 p-8 bg-[#1a1a1a] min-h-screen">
      <Card className="max-w-2xl mx-auto bg-[#242424] border-0">
        <CardHeader>
          <CardTitle className="text-white">CREAR MEMBRESÍA</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-green-500 block mb-1">Nombre de la Membresía</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white text-black"
                required
              />
            </div>
            <div>
              <label className="text-green-500 block mb-1">Servicios (uno por línea)</label>
              <Textarea
                value={formData.services}
                onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                className="bg-white text-black min-h-[100px]"
                required
              />
            </div>
            <div>
              <label className="text-green-500 block mb-1">Precio ($)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="bg-white text-black"
                required
              />
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1 bg-green-500 hover:bg-green-600">
                Crear
              </Button>
              <Button
                type="button"
                onClick={() => router.push("/memberships")}
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

