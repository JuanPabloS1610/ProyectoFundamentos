"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Plus, Trash2, MoveUp, MoveDown } from "lucide-react"
import { supabase } from "../../../lib/supabaseClient"

interface Exercise {
  name: string
  sets: number
  repetitions: string
  order_index: number
}

export default function CreateRoutinePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [exercises, setExercises] = useState<Exercise[]>([{ name: "", sets: 3, repetitions: "", order_index: 0 }])

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      {
        name: "",
        sets: 3,
        repetitions: "",
        order_index: exercises.length,
      },
    ])
  }

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
    setExercises((prev) =>
      prev.map((exercise, i) => ({
        ...exercise,
        order_index: i,
      })),
    )
  }

  const handleExerciseChange = (index: number, field: keyof Exercise, value: string | number) => {
    const newExercises = [...exercises]
    newExercises[index] = {
      ...newExercises[index],
      [field]: value,
    }
    setExercises(newExercises)
  }

  const moveExercise = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === exercises.length - 1)) {
      return
    }

    const newExercises = [...exercises]
    const newIndex = direction === "up" ? index - 1 : index + 1
    const temp = newExercises[index]
    newExercises[index] = newExercises[newIndex]
    newExercises[newIndex] = temp

    setExercises(
      newExercises.map((exercise, i) => ({
        ...exercise,
        order_index: i,
      })),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data: routineData, error: routineError } = await supabase
        .from("routines")
        .insert([
          {
            name,
            type,
            difficulty,
            exercise_count: exercises.length,
          },
        ])
        .select()
        .single()

      if (routineError) throw routineError

      const { error: exercisesError } = await supabase.from("exercises").insert(
        exercises.map((exercise) => ({
          routine_id: routineData.id,
          name: exercise.name,
          sets: exercise.sets,
          repetitions: exercise.repetitions,
          order_index: exercise.order_index,
        })),
      )

      if (exercisesError) throw exercisesError

      router.push("/routines")
    } catch (error: unknown) {
      console.error("Error creating routine:", error)
      if (error instanceof Error) {
        console.error("Error message:", error.message)
      }
      if (typeof error === "object" && error !== null) {
        console.error("Error details:", JSON.stringify(error, null, 2))
      }
    }
  }

  return (
    <div className="flex-1 min-h-screen bg-[#1a1a1a] p-8">
      <Card className="max-w-4xl mx-auto bg-[#242424] border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Crear Nueva Rutina</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Nombre de la Rutina</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#333] border-0 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Tipo</label>
                <Select value={type} onValueChange={setType} required>
                  <SelectTrigger className="bg-[#333] border-0 text-white">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#333] border-0">
                    <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                    <SelectItem value="fuerza">Fuerza</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Dificultad</label>
                <Select value={difficulty} onValueChange={setDifficulty} required>
                  <SelectTrigger className="bg-[#333] border-0 text-white">
                    <SelectValue placeholder="Seleccionar dificultad" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#333] border-0">
                    <SelectItem value="principiante">Principiante</SelectItem>
                    <SelectItem value="intermedio">Intermedio</SelectItem>
                    <SelectItem value="avanzado">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Ejercicios</h3>
                <Button type="button" onClick={handleAddExercise} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Ejercicio
                </Button>
              </div>

              {exercises.map((exercise, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-[#333] p-4 rounded-lg">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Nombre del Ejercicio</label>
                    <Input
                      value={exercise.name}
                      onChange={(e) => handleExerciseChange(index, "name", e.target.value)}
                      className="bg-[#444] border-0 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Sets</label>
                    <Input
                      type="number"
                      min="1"
                      value={exercise.sets}
                      onChange={(e) => handleExerciseChange(index, "sets", Number.parseInt(e.target.value))}
                      className="bg-[#444] border-0 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Repeticiones</label>
                    <Input
                      value={exercise.repetitions}
                      onChange={(e) => handleExerciseChange(index, "repetitions", e.target.value)}
                      className="bg-[#444] border-0 text-white"
                      placeholder="Ej: 12, 10-12, o Hasta el fallo"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                      onClick={() => moveExercise(index, "up")}
                      disabled={index === 0}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                      onClick={() => moveExercise(index, "down")}
                      disabled={index === exercises.length - 1}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => handleRemoveExercise(index)}
                      disabled={exercises.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                Crear Rutina
              </Button>
              <Button
                type="button"
                onClick={() => router.push("/routines")}
                className="flex-1 bg-gray-600 hover:bg-gray-700"
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

