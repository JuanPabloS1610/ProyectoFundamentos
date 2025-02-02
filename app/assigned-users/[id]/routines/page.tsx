"use client"

import { useEffect, useState } from "react"
import { Card } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { ChevronDown, Plus } from "lucide-react"
import { useParams } from "next/navigation"
import { supabase } from "../../../../lib/supabaseClient"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"

interface UserRoutine {
  id: string
  routine_id: string
  start_date: string
  progress: number
  routines: {
    name: string
    difficulty: string
  }
}

interface AvailableRoutine {
  id: string
  name: string
}

export default function UserRoutinesPage() {
  const params = useParams()
  const userId = params.id as string
  const [routines, setRoutines] = useState<UserRoutine[]>([])
  const [userName, setUserName] = useState("")
  const [availableRoutines, setAvailableRoutines] = useState<AvailableRoutine[]>([])
  const [selectedRoutine, setSelectedRoutine] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchUserAndRoutines = async () => {
      try {
        const { data: userData } = await supabase.from("users").select("nombre").eq("id", userId).single()

        if (userData) {
          setUserName(userData.nombre)
        }

        const { data: routinesData } = await supabase
          .from("assigned_routines")
          .select(`
            id,
            routine_id,
            start_date,
            progress,
            routines (
              name,
              difficulty
            )
          `)
          .eq("user_id", userId)

        if (routinesData) {
          const formattedRoutines: UserRoutine[] = routinesData.map((routine: any) => ({
            id: routine.id,
            routine_id: routine.routine_id,
            start_date: routine.start_date,
            progress: routine.progress,
            routines: {
              name: routine.routines.name,
              difficulty: routine.routines.difficulty,
            },
          }))
          setRoutines(formattedRoutines)
        }

        const { data: availableRoutinesData } = await supabase.from("routines").select("id, name")

        if (availableRoutinesData) {
          setAvailableRoutines(availableRoutinesData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchUserAndRoutines()
  }, [userId])

  const handleAssignRoutine = async () => {
    if (!selectedRoutine) return

    try {
      const { error } = await supabase.from("assigned_routines").insert({
        user_id: userId,
        routine_id: selectedRoutine,
        start_date: new Date().toISOString(),
        progress: 0,
      })

      if (error) throw error

      const { data: newRoutinesData } = await supabase
        .from("assigned_routines")
        .select(`
          id,
          routine_id,
          start_date,
          progress,
          routines (
            name,
            difficulty
          )
        `)
        .eq("user_id", userId)

      if (newRoutinesData) {
        const formattedRoutines: UserRoutine[] = newRoutinesData.map((routine: any) => ({
          id: routine.id,
          routine_id: routine.routine_id,
          start_date: routine.start_date,
          progress: routine.progress,
          routines: {
            name: routine.routines.name,
            difficulty: routine.routines.difficulty,
          },
        }))
        setRoutines(formattedRoutines)
      }

      setIsDialogOpen(false)
      setSelectedRoutine("")
    } catch (error) {
      console.error("Error assigning routine:", error)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "principiante":
        return "bg-green-600"
      case "intermedio":
        return "bg-yellow-600"
      case "avanzado":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div className="flex-1 min-h-screen bg-[#1a1a1a] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">CLIENTE: {userName}</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#242424] text-white hover:bg-[#333]">
                <Plus className="h-4 w-4 mr-2" />
                Asignar rutina
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#242424] text-white border-0">
              <DialogHeader>
                <DialogTitle>Asignar Nueva Rutina</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Select value={selectedRoutine} onValueChange={setSelectedRoutine}>
                  <SelectTrigger className="bg-[#333] border-0">
                    <SelectValue placeholder="Seleccionar rutina" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#333] border-0">
                    {availableRoutines.map((routine) => (
                      <SelectItem key={routine.id} value={routine.id}>
                        {routine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAssignRoutine} className="w-full bg-green-600 hover:bg-green-700">
                  Asignar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-[#242424] border-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">OR Usuario</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Rutina</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Usuario</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Progreso</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Inicio de la Rutina
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {routines.map((routine) => (
                  <tr key={routine.id} className="border-b border-gray-700">
                    <td className="px-4 py-4 text-sm text-gray-300">{routine.routine_id}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getDifficultyColor(
                          routine.routines.difficulty,
                        )}`}
                      >
                        {routine.routines.name}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300">{userName}</td>
                    <td className="px-4 py-4">
                      <div className="relative w-12 h-12">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            className="text-gray-700"
                            strokeWidth="4"
                            stroke="currentColor"
                            fill="transparent"
                            r="20"
                            cx="24"
                            cy="24"
                          />
                          <circle
                            className="text-green-500"
                            strokeWidth="4"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="20"
                            cx="24"
                            cy="24"
                            strokeDasharray={`${routine.progress * 1.25}, 125`}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                          {routine.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300">{new Date(routine.start_date).toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <Button variant="ghost" size="icon">
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

