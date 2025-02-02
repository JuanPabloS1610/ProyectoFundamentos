"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Checkbox } from "../../components/ui/checkbox"
import { ChevronDown } from 'lucide-react'
import { supabase } from "../../lib/supabaseClient"
import { useRouter } from "next/navigation"

interface Routine {
  id: string
  name: string
  coach: string
  start_date: string
  exercises: string[]
}

interface Service {
  name: string
  image_url?: string
}

interface Membership {
  id: string
  name: string
  services: string[] 
}

const serviceImages: Record<string, string> = {
  "área funcional": "https://images.pexels.com/photos/791763/pexels-photo-791763.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "área de maquinas": "https://images.pexels.com/photos/18060067/pexels-photo-18060067/free-photo-of-blanco-y-negro-deporte-ejercicio-entrenamiento.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "bailo terapia": "https://images.pexels.com/photos/864990/pexels-photo-864990.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  piscina: "https://images.pexels.com/photos/261185/pexels-photo-261185.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  duchas: "https://images.pexels.com/photos/8028627/pexels-photo-8028627.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "coach nutricional": "https://images.pexels.com/photos/30382432/pexels-photo-30382432/free-photo-of-ensalada-picante.png?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "plan nutricional": "https://images.pexels.com/photos/7900031/pexels-photo-7900031.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
};

export default function ProfilePage() {
  const router = useRouter()
  const [routines, setRoutines] = useState<Routine[]>([])
  const [membership, setMembership] = useState<Membership | null>(null)
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null)
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchUserData = async () => {
      const userEmail = localStorage.getItem("userEmail")
      if (!userEmail) return

      try {
        const { data: userData } = await supabase
          .from("users")
          .select("id, membership_id")
          .eq("correo", userEmail)
          .single()

        if (userData) {
          const { data: routinesData } = await supabase
            .from("assigned_routines")
            .select("*, routines(*)")
            .eq("user_id", userData.id)

          if (routinesData) {
            setRoutines(
              routinesData.map((r) => ({
                id: r.routine_id,
                name: r.routines.name,
                coach: "----------", 
                start_date: r.start_date,
                exercises: Array(6)
                  .fill(0)
                  .map((_, i) => `Ejercicio ${i + 1}`),
              })),
            )
          }

          if (userData.membership_id) {
            const { data: membershipData, error: membershipError } = await supabase
              .from("memberships")
              .select("*")
              .eq("id", userData.membership_id)
              .single()

            if (membershipError) {
              console.error("Error fetching membership:", membershipError)
            } else if (membershipData) {
              setMembership({
                id: membershipData.id,
                name: membershipData.name,
                services: membershipData.services || [], 
              })
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchUserData()
  }, [])

  const toggleExercise = (routineId: string, exerciseIndex: string) => {
    const key = `${routineId}-${exerciseIndex}`
    setCompletedExercises((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div className="flex-1 min-h-screen bg-[#1a1a1a] p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">RUTINAS</h2>
          <Card className="bg-[#242424] border-0">
            <CardContent className="p-6">
              <div className="w-full aspect-square rounded-lg bg-green-500 mb-6" />
              <Button
                variant="ghost"
                className="w-full justify-between text-white hover:bg-[#333]"
                onClick={() => router.push("/routines")}
              >
                Mis rutinas
                <ChevronDown />
              </Button>
            </CardContent>
          </Card>

          
        </div>

        {/* Services Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Servicios</h2>
          <Card className="bg-[#242424] border-0">
            <CardHeader>
              <CardTitle className="text-white text-center">SERVICIOS DEL GYM</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {membership?.services.map((service, index) => (
                <div key={index} className="space-y-2">
                  <p className="text-white text-center">{service}</p>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img
                      src={serviceImages[service.toLowerCase()] || "https://images.pexels.com/photos/17883764/pexels-photo-17883764/free-photo-of-blanco-y-negro-hombre-deporte-ejercicio.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                      alt={service}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full justify-between text-white hover:bg-[#333]" onClick={() => {}}>
                Ver información
                <ChevronDown />
              </Button>
            </CardContent>
          </Card>
        </div>

        {selectedRoutine &&
          routines.map((routine) => (
            <Card key={routine.id} className="bg-[#242424] border-0 col-start-2">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {routine.exercises.map((exercise, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        checked={completedExercises[`${routine.id}-${index}`]}
                        onCheckedChange={() => toggleExercise(routine.id, index.toString())}
                        className="border-purple-500"
                      />
                      <span className="text-white">{exercise} Completo</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}