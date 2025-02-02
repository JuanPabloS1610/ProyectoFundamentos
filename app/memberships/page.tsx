"use client"

import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabaseClient"
import { Pencil, Trash } from "lucide-react"
import { useToast } from "../../components/ui/use-toast"

interface Membership {
  id: string
  name: string
  services: string[]
  price: number
}

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchMemberships()
  }, [])

  const fetchMemberships = async () => {
    const { data, error } = await supabase.from("memberships").select("*")
    if (error) {
      console.error("Error fetching memberships:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las membresías. Por favor, intente de nuevo.",
        variant: "destructive",
      })
    } else {
      setMemberships(data || [])
    }
  }

  const handleEdit = (membership: Membership) => {
    setEditingMembership(membership)
  }

  const handleSave = async () => {
    if (!editingMembership) return

    const { data, error } = await supabase
      .from("memberships")
      .update({
        name: editingMembership.name,
        services: editingMembership.services,
        price: editingMembership.price,
      })
      .eq("id", editingMembership.id)

    if (error) {
      console.error("Error updating membership:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la membresía. Por favor, intente de nuevo.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Éxito",
        description: "Membresía actualizada correctamente.",
        variant: "success",
      })
      setEditingMembership(null)
      fetchMemberships()
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("memberships").delete().eq("id", id)

    if (error) {
      console.error("Error deleting membership:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la membresía. Por favor, intente de nuevo.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Éxito",
        description: "Membresía eliminada correctamente.",
        variant: "success",
      })
      fetchMemberships()
    }
  }

  return (
    <div className="flex-1 p-8 bg-[#1a1a1a] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Consultar Membresías</h1>
          <Button onClick={() => router.push("/memberships/create")} className="bg-[#9333ea] hover:bg-[#7928ca]">
            Nueva Membresía
          </Button>
        </div>

        <div className="space-y-6">
          {memberships.map((membership) => (
            <Card key={membership.id} className="bg-[#242424] border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-white text-xl">
                  {editingMembership?.id === membership.id ? (
                    <Input
                      value={editingMembership.name}
                      onChange={(e) => setEditingMembership({ ...editingMembership, name: e.target.value })}
                      className="bg-[#333] text-white border-0"
                    />
                  ) : (
                    membership.name
                  )}
                </CardTitle>
                <div className="flex space-x-2">
                  {editingMembership?.id === membership.id ? (
                    <Button onClick={handleSave} className="bg-green-500 hover:bg-green-600">
                      Guardar
                    </Button>
                  ) : (
                    <Button onClick={() => handleEdit(membership)} className="bg-blue-500 hover:bg-blue-600">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button onClick={() => handleDelete(membership.id)} className="bg-red-500 hover:bg-red-600">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-white mb-2">Servicios:</div>
                {editingMembership?.id === membership.id ? (
                  <Input
                    value={editingMembership.services.join(", ")}
                    onChange={(e) =>
                      setEditingMembership({
                        ...editingMembership,
                        services: e.target.value.split(", "),
                      })
                    }
                    className="bg-[#333] text-white border-0 mb-2"
                  />
                ) : (
                  <ul className="list-disc list-inside text-gray-300 mb-2">
                    {membership.services.map((service, index) => (
                      <li key={index}>{service}</li>
                    ))}
                  </ul>
                )}
                <div className="text-white">
                  Precio: $
                  {editingMembership?.id === membership.id ? (
                    <Input
                      type="number"
                      value={editingMembership.price}
                      onChange={(e) =>
                        setEditingMembership({
                          ...editingMembership,
                          price: Number.parseFloat(e.target.value),
                        })
                      }
                      className="bg-[#333] text-white border-0 inline-block w-24 ml-2"
                    />
                  ) : (
                    membership.price
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

