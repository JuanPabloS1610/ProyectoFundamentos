"use client"

import { useEffect, useState } from "react"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "../../../../lib/supabaseClient"
import { useToast } from "../../../../components/ui/use-toast"

interface Template {
  id: string
  name: string
  difficulty: string
  exercise_count: number
  exercises: string
}

export default function EditRoutine() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [template, setTemplate] = useState<Template | null>(null)

  useEffect(() => {
    const fetchTemplate = async () => {
      const { data, error } = await supabase.from("routines").select("*").eq("id", params.id).single()

      if (error) {
        console.error("Error fetching template:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la plantilla. Por favor, intente de nuevo.",
          variant: "destructive",
        })
      } else {
        setTemplate(data)
      }
    }

    fetchTemplate()
  }, [params.id, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!template) return

    const { error } = await supabase
      .from("routines")
      .update({
        name: template.name,
        difficulty: template.difficulty,
        exercise_count: template.exercise_count,
        exercises: template.exercises,
      })
      .eq("id", template.id)

    if (error) {
      console.error("Error updating template:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la plantilla. Por favor, intente de nuevo.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Éxito",
        description: "Plantilla actualizada correctamente.",
        variant: "success",
      })
      router.push("/routines/templates")
    }
  }

  if (!template) {
    return <div className="text-white">Cargando...</div>
  }

  return (
    <div className="flex-1 p-8 bg-[#1a1a1a] min-h-screen">
      <Card className="max-w-3xl mx-auto bg-[#242424] border-0">
        <CardHeader>
          <CardTitle className="text-white">EDITAR PLANTILLA</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-green-500 block mb-2">Rutina Para</label>
              <Input
                className="bg-white text-black"
                value={template.name}
                onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-green-500 block mb-2">Dificultad</label>
              <Input
                className="bg-white text-black"
                value={template.difficulty}
                onChange={(e) => setTemplate({ ...template, difficulty: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-green-500 block mb-2">Numero de ejercicios</label>
              <Input
                className="bg-white text-black w-1/2"
                type="number"
                value={template.exercise_count}
                onChange={(e) => setTemplate({ ...template, exercise_count: Number.parseInt(e.target.value) })}
                required
              />
            </div>

            <div>
              <label className="text-green-500 block mb-2">Listado de ejercicios</label>
              <Input
                className="bg-white text-black"
                value={template.exercises}
                onChange={(e) => setTemplate({ ...template, exercises: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" className="flex-1 bg-green-500 hover:bg-green-600">
                Guardar
              </Button>
              <Button
                type="button"
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={() => router.push("/routines/templates")}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

