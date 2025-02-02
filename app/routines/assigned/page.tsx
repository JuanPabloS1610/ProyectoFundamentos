"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs"
import { Progress } from "../../../components/ui/progress"
import { Search, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"

interface User {
  id: string
  nombre: string
  user_type: string 
}

interface Routine {
  id: string
  name: string
  type: string
  level: string
}

interface Coach {
  id: string
  user_id: string
  nombre: string
}

interface AssignedRoutine {
  id: string
  user_id: string
  routine_id: string
  start_date: string
  progress: number
  users: { nombre: string }
  routines: { name: string }
}

interface AssignedCoach {
  id: string
  user_id: string
  coach_id: string
  assigned_at: string
  users: { nombre: string }
  coaches: { users: { nombre: string } }
}

export default function AssignedRoutinesPage() {
  const [users, setUsers] = useState<User[]>([])
  const [routines, setRoutines] = useState<Routine[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [assignedRoutines, setAssignedRoutines] = useState<AssignedRoutine[]>([])
  const [assignedCoaches, setAssignedCoaches] = useState<AssignedCoach[]>([])
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [selectedRoutine, setSelectedRoutine] = useState<string>("")
  const [selectedCoach, setSelectedCoach] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [routineType, setRoutineType] = useState<string>("all")
  const [isRoutineDialogOpen, setIsRoutineDialogOpen] = useState(false)
  const [isCoachDialogOpen, setIsCoachDialogOpen] = useState(false)
  const [userType, setUserType] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
    fetchRoutines()
    fetchCoaches()
    fetchAssignedRoutines()
    fetchAssignedCoaches()
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)
  }, [])

  async function fetchUsers() {
    const { data, error } = await supabase.from("users").select("id, nombre, user_type").eq("user_type", "Cliente") 

    if (error) {
      console.error("Error fetching users:", error)
    } else {
      setUsers(data || [])
    }
  }

  async function fetchRoutines() {
    const { data, error } = await supabase.from("routines").select("*")
    if (error) console.error("Error fetching routines:", error)
    else setRoutines(data || [])
  }

  async function fetchCoaches() {
    const { data: coachesData, error: coachesError } = await supabase.from("coaches").select("id, user_id")

    if (coachesError) {
      console.error("Error fetching coaches:", coachesError)
      return
    }

    const userIds = coachesData.map((coach) => coach.user_id)
    const { data: usersData, error: usersError } = await supabase.from("users").select("id, nombre").in("id", userIds)

    if (usersError) {
      console.error("Error fetching coach names:", usersError)
      return
    }

    const coachesWithNames = coachesData.map((coach) => {
      const user = usersData.find((user) => user.id === coach.user_id)
      return {
        id: coach.id,
        user_id: coach.user_id,
        nombre: user ? user.nombre : "Unknown",
      }
    })

    setCoaches(coachesWithNames)
  }

  async function fetchAssignedRoutines() {
    const { data, error } = await supabase.from("assigned_routines").select("*, users(nombre), routines(name)")
    if (error) console.error("Error fetching assigned routines:", error)
    else setAssignedRoutines(data || [])
  }

  async function fetchAssignedCoaches() {
    const { data, error } = await supabase.from("assigned_coaches").select("*, users(nombre), coaches(user_id)")
    if (error) console.error("Error fetching assigned coaches:", error)
    else setAssignedCoaches(data || [])
  }

  async function handleAssignRoutine() {
    if (!selectedUser || !selectedRoutine) return

    const { error } = await supabase.from("assigned_routines").insert({
      user_id: selectedUser,
      routine_id: selectedRoutine,
      start_date: new Date().toISOString(),
      progress: 0,
    })

    if (error) {
      console.error("Error assigning routine:", error)
    } else {
      fetchAssignedRoutines()
      setIsRoutineDialogOpen(false)
      setSelectedUser("")
      setSelectedRoutine("")
    }
  }

  async function handleAssignCoach() {
    if (!selectedUser || !selectedCoach) return

    const { error } = await supabase.from("assigned_coaches").insert({
      user_id: selectedUser,
      coach_id: selectedCoach,
    })

    if (error) {
      console.error("Error assigning coach:", error)
    } else {
      fetchAssignedCoaches()
      setIsCoachDialogOpen(false)
      setSelectedUser("")
      setSelectedCoach("")
    }
  }

  const filteredRoutines = routines.filter((routine) => (routineType === "all" ? true : routine.type === routineType))

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-6 ml-20">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">RUTINAS Y ENTRENADORES</h1>
        </div>

        <div className="flex justify-between items-center">
          <Tabs defaultValue="assigned" className="w-[400px]">
            <TabsList className="bg-[#242424]">
              <TabsTrigger value="templates" className="text-white">
                Plantillas
              </TabsTrigger>
              <TabsTrigger value="assigned" className="text-white">
                Asignadas
              </TabsTrigger>
            </TabsList>
            <TabsContent value="templates"></TabsContent>
            <TabsContent value="assigned"></TabsContent>
          </Tabs>

          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar usuarios"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[300px] pl-10 bg-[#242424] border-0 text-white"
              />
            </div>

            <Dialog open={isRoutineDialogOpen} onOpenChange={setIsRoutineDialogOpen}>
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
                  <div className="space-y-2">
                    <label>Usuario</label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger className="bg-[#333] border-0">
                        <SelectValue placeholder="Seleccionar usuario" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#333] border-0">
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label>Rutina</label>
                    <Select value={selectedRoutine} onValueChange={setSelectedRoutine}>
                      <SelectTrigger className="bg-[#333] border-0">
                        <SelectValue placeholder="Seleccionar rutina" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#333] border-0">
                        {routines.map((routine) => (
                          <SelectItem key={routine.id} value={routine.id}>
                            {routine.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAssignRoutine} className="w-full bg-green-600 hover:bg-green-700">
                    Asignar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {userType === "Administrador" && (
              <Dialog open={isCoachDialogOpen} onOpenChange={setIsCoachDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#242424] text-white hover:bg-[#333]">
                    <Plus className="h-4 w-4 mr-2" />
                    Asignar entrenador
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#242424] text-white border-0">
                  <DialogHeader>
                    <DialogTitle>Asignar Nuevo Entrenador</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label>Usuario</label>
                      <Select value={selectedUser} onValueChange={setSelectedUser}>
                        <SelectTrigger className="bg-[#333] border-0">
                          <SelectValue placeholder="Seleccionar usuario" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#333] border-0">
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label>Entrenador</label>
                      <Select value={selectedCoach} onValueChange={setSelectedCoach}>
                        <SelectTrigger className="bg-[#333] border-0">
                          <SelectValue placeholder="Seleccionar entrenador" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#333] border-0">
                          {coaches.map((coach) => (
                            <SelectItem key={coach.id} value={coach.id}>
                              {coach.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAssignCoach} className="w-full bg-green-600 hover:bg-green-700">
                      Asignar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            className={`text-white hover:bg-[#333] ${routineType === "hipertrofia" ? "bg-[#333]" : ""}`}
            onClick={() => setRoutineType("hipertrofia")}
          >
            Hipertrofia
          </Button>
          <Button
            variant="ghost"
            className={`text-white hover:bg-[#333] ${routineType === "fuerza" ? "bg-[#333]" : ""}`}
            onClick={() => setRoutineType("fuerza")}
          >
            Fuerza
          </Button>
        </div>

        <div className="bg-[#242424] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Rutina
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Progreso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Inicio de la Rutina
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Entrenador Asignado
                </th>
              </tr>
            </thead>
            <tbody>
              {assignedRoutines
                .filter((ar) => ar.users?.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((ar) => {
                  const assignedCoach = assignedCoaches.find((ac) => ac.user_id === ar.user_id)
                  return (
                    <tr key={ar.id} className="border-b border-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{ar.users?.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{ar.routines?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <Progress value={ar.progress} className="w-32" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(ar.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {assignedCoach ? coaches.find((c) => c.id === assignedCoach.coach_id)?.nombre : "No asignado"}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

