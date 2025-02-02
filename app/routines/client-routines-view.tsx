"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "../../components/ui/card"
import { Checkbox } from "../../components/ui/checkbox"
import { Book, Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { supabase } from "../../lib/supabaseClient"

interface Exercise {
  name: string
  sets: number
  repetitions: string
  order_index: number
}

interface DBRoutine {
  id: string
  name: string
  exercises: Exercise[]
}

interface AssignedRoutine {
  id: string
  user_id: string
  routine_id: string
  start_date: string
  progress: number
  routines: DBRoutine
}

interface DisplayRoutine {
  id: string
  name: string
  coach: string
  start_date: string
  exercises: Exercise[]
  progress: number
}

export default function ClientRoutinesView() {
  const [routines, setRoutines] = useState<DisplayRoutine[]>([])
  const [selectedRoutine, setSelectedRoutine] = useState<DisplayRoutine | null>(null)
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchRoutines = async () => {
      const userEmail = localStorage.getItem("userEmail")
      if (!userEmail) return

      try {
        const { data: userData } = await supabase.from("users").select("id").eq("correo", userEmail).single()

        if (userData) {
          const { data: assignedRoutines } = await supabase
            .from("assigned_routines")
            .select(`
              *,
              routines (
                id,
                name,
                exercises (
                  name,
                  sets,
                  repetitions,
                  order_index
                )
              )
            `)
            .eq("user_id", userData.id)

          if (assignedRoutines) {
            const formattedRoutines: DisplayRoutine[] = assignedRoutines.map((ar: AssignedRoutine) => {
              return {
                id: ar.routine_id,
                name: ar.routines?.name || "Sin nombre",
                coach: "----------",
                start_date: ar.start_date,
                exercises: ar.routines?.exercises || [],
                progress: ar.progress || 0,
              }
            })

            setRoutines(formattedRoutines)

            const initialCompletedExercises: Record<string, boolean> = {}
            formattedRoutines.forEach((routine) => {
              if (Array.isArray(routine.exercises)) {
                const exercisesCount = routine.exercises.length
                const completedCount = Math.round((routine.progress / 100) * exercisesCount)
                routine.exercises.forEach((_, index) => {
                  initialCompletedExercises[`${routine.id}-${index}`] = index < completedCount
                })
              }
            })
            setCompletedExercises(initialCompletedExercises)
          }
        }
      } catch (error) {
        console.error("Error fetching routines:", error)
      }
    }

    fetchRoutines()
  }, [])

  const updateProgress = async (routineId: string, progress: number) => {
    const userEmail = localStorage.getItem("userEmail")
    if (!userEmail) return

    try {
      const { data: userData } = await supabase.from("users").select("id").eq("correo", userEmail).single()

      if (userData) {
        const { error } = await supabase
          .from("assigned_routines")
          .update({ progress })
          .match({ user_id: userData.id, routine_id: routineId })

        if (error) throw error

        setRoutines((prevRoutines) =>
          prevRoutines.map((routine) => (routine.id === routineId ? { ...routine, progress } : routine)),
        )
      }
    } catch (error) {
      console.error("Error updating progress:", error)
    }
  }

  const handleExerciseToggle = (routineId: string, exerciseIndex: number) => {
    setCompletedExercises((prev) => {
      const key = `${routineId}-${exerciseIndex}`
      const newCompletedExercises = { ...prev, [key]: !prev[key] }

      const routine = routines.find((r) => r.id === routineId)
      if (routine && Array.isArray(routine.exercises)) {
        const totalExercises = routine.exercises.length
        const completedCount = routine.exercises.filter(
          (_, index) => newCompletedExercises[`${routineId}-${index}`],
        ).length
        const newProgress = Math.round((completedCount / totalExercises) * 100)

        updateProgress(routineId, newProgress)
      }

      return newCompletedExercises
    })
  }

  const filteredRoutines = routines.filter((routine) => routine.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex-1 min-h-screen bg-[#1a1a1a] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">MIS RUTINAS</h1>
          <div className="relative w-72">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar mis rutinas"
              className="pl-8 bg-[#242424] border-0 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredRoutines.map((routine) => (
            <Card key={routine.id} className="bg-[#242424] border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{routine.name}</h3>
                    <div className="space-y-2 text-gray-400">
                      <p>COACH: {routine.coach}</p>
                      <p>INICIO DE LA RUTINA: {new Date(routine.start_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-purple-500 hover:text-purple-400 hover:bg-[#333]"
                    onClick={() => setSelectedRoutine(routine)}
                  >
                    <Book className="h-5 w-5" />
                  </Button>
                </div>
                <Progress value={routine.progress} className="h-2 mb-2" />
                <p className="text-white text-sm">{routine.progress}% completado</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={!!selectedRoutine} onOpenChange={() => setSelectedRoutine(null)}>
          <DialogContent className="bg-[#242424] text-white border-0 max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{selectedRoutine?.name}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <table className="w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      EJERCICIO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SERIES
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      REPETICIONES
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      COMPLETADO
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedRoutine?.exercises &&
                    Array.isArray(selectedRoutine.exercises) &&
                    selectedRoutine.exercises.map((exercise, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exercise.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exercise.sets}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exercise.repetitions}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <Checkbox
                            checked={completedExercises[`${selectedRoutine.id}-${index}`]}
                            onCheckedChange={() => handleExerciseToggle(selectedRoutine.id, index)}
                            className="border-purple-500"
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

