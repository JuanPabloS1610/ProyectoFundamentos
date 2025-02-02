"use client"

import { useEffect, useState } from "react"
import { Pencil, Trash2, Plus, Search } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabaseClient"
import { useToast } from "../../../components/ui/use-toast"

interface Template {
  id: string
  name: string
  difficulty: string
  exercise_count: number
  exercises: string
}

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    const { data, error } = await supabase.from("routines").select("*")
    if (error) {
      console.error("Error fetching templates:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas. Por favor, intente de nuevo.",
        variant: "destructive",
      })
    } else {
      setTemplates(data || [])
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("routines").delete().eq("id", id)
    if (error) {
      console.error("Error deleting template:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la plantilla. Por favor, intente de nuevo.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Éxito",
        description: "Plantilla eliminada correctamente.",
        variant: "success",
      })
      fetchTemplates()
    }
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterType || template.name === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="flex-1 min-h-screen bg-[#1a1a1a] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <Button variant="ghost" className="text-white">
              Plantillas
            </Button>
            <Button variant="ghost" className="text-white" onClick={() => router.push("/routines/assigned")}>
              Asignadas
            </Button>
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                className="bg-[#242424] border-0 pl-10 text-white w-[300px]"
                placeholder="Buscar plantilla"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => router.push("/routines/create")} className="bg-[#242424] text-white hover:bg-[#333]">
              <Plus className="mr-2 h-4 w-4" />
              Crear plantilla
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <Button
            variant="ghost"
            className={`text-white ${filterType === "Hipertrofia" ? "bg-[#242424]" : ""}`}
            onClick={() => setFilterType("Hipertrofia")}
          >
            Hipertrofia
          </Button>
          <Button
            variant="ghost"
            className={`text-white ${filterType === "Fuerza" ? "bg-[#242424]" : ""}`}
            onClick={() => setFilterType("Fuerza")}
          >
            Fuerza
          </Button>
          <Input
            className="bg-[#242424] border-0 text-white w-[200px]"
            placeholder="Rutina para"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          />
        </div>

        {templates.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No hay plantillas creadas. Crea una nueva plantilla para empezar.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="bg-[#242424] rounded-lg overflow-hidden">
                <div className="p-4 bg-[#9333ea]">
                  <h3 className="text-white font-bold">
                    {template.name.toUpperCase()} - {template.difficulty.toUpperCase()}
                  </h3>
                </div>
                <div className="p-4">
                  <table className="w-full text-white">
                    <thead>
                      <tr>
                        <th className="text-left">EJERCICIO</th>
                        <th className="text-center">SERIES</th>
                        <th className="text-center">REPETICIONES</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr>
                        <td>{template.exercises}</td>
                        <td className="text-center">{template.exercise_count}</td>
                        <td className="text-center">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="p-4 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#9333ea] hover:text-white hover:bg-[#9333ea]"
                    onClick={() => router.push(`/routines/edit/${template.id}`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-white hover:bg-red-500"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

