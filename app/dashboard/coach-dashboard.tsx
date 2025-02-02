"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "../../components/ui/card"
import { User } from "lucide-react"
import { supabase } from "../../lib/supabaseClient"

interface CoachData {
  id: string
  nombre: string
  cedula: string
  correo: string
  specialties?: string[]
  philosophy?: string
}

export default function CoachDashboard() {
  const [coachData, setCoachData] = useState<CoachData | null>(null)

  useEffect(() => {
    const fetchCoachData = async () => {
      const userEmail = localStorage.getItem("userEmail")
      if (!userEmail) return

      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, nombre, cedula, correo")
          .eq("correo", userEmail)
          .single()

        if (userError) throw userError

        if (userData) {
          const { data: coachData, error: coachError } = await supabase
            .from("coaches")
            .select("specialties, philosophy")
            .eq("user_id", userData.id)
            .single()

          if (coachError) throw coachError

          setCoachData({
            ...userData,
            specialties: coachData?.specialties || [],
            philosophy: coachData?.philosophy,
          })
        }
      } catch (error) {
        console.error("Error fetching coach data:", error)
      }
    }

    fetchCoachData()
  }, [])

  if (!coachData) return null

  return (
    <div className="flex-1 min-h-screen bg-[#1a1a1a] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Panel de entrenador</h1>

        <Card className="bg-[#242424] border-0">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 bg-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-16 h-16 text-white" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="bg-purple-600 text-white px-4 py-2 rounded-t-lg">Nombre</div>
                  <div className="bg-[#1a1a1a] text-white px-4 py-2 rounded-b-lg">{coachData.nombre}</div>
                </div>

                <div>
                  <div className="bg-purple-600 text-white px-4 py-2 rounded-t-lg">Cedula</div>
                  <div className="bg-[#1a1a1a] text-white px-4 py-2 rounded-b-lg">{coachData.cedula}</div>
                </div>

                <div>
                  <div className="bg-purple-600 text-white px-4 py-2 rounded-t-lg">Correo</div>
                  <div className="bg-[#1a1a1a] text-white px-4 py-2 rounded-b-lg">{coachData.correo}</div>
                </div>

                <div>
                  <div className="bg-purple-600 text-white px-4 py-2 rounded-t-lg">Especialidades</div>
                  <div className="bg-[#1a1a1a] text-white px-4 py-2 rounded-b-lg">
                    {coachData.specialties?.join(", ") || "No especificadas"}
                  </div>
                </div>

                <div>
                  <div className="bg-purple-600 text-white px-4 py-2 rounded-t-lg">Filosofía</div>
                  <div className="bg-[#1a1a1a] text-white px-4 py-2 rounded-b-lg">
                    {coachData.philosophy || "No especificada"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

