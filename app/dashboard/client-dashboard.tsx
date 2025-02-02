"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { supabase } from "../../lib/supabaseClient"
import { Rating } from "../../components/ui/rating"

interface Membership {
  id: string
  name: string
  price: number
}

interface UserData {
  id: string
  nombre: string
  created_at: string
  membresia: string
  membership_id: string | null
}

interface RoutineProgress {
  id: string
  progress: number
}

export default function ClientDashboard() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [membershipData, setMembershipData] = useState<Membership | null>(null)
  const [routineProgress, setRoutineProgress] = useState<RoutineProgress[]>([])
  const [overallProgress, setOverallProgress] = useState(0)
  const [gymRating, setGymRating] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const userEmail = localStorage.getItem("userEmail")
      if (!userEmail) return

      try {
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("id, nombre, created_at, membresia, membership_id")
          .eq("correo", userEmail)
          .single()

        if (userError) throw userError

        if (user) {
          setUserData(user)

          if (user.membership_id) {
            const { data: membership, error: membershipError } = await supabase
              .from("memberships")
              .select("id, name, price")
              .eq("id", user.membership_id)
              .single()

            if (membershipError) throw membershipError

            if (membership) {
              setMembershipData(membership)
            }
          }

          const { data: routines, error: routinesError } = await supabase
            .from("assigned_routines")
            .select("id, progress")
            .eq("user_id", user.id)

          if (routinesError) throw routinesError

          if (routines) {
            setRoutineProgress(routines)

            const totalProgress = routines.reduce((sum, routine) => sum + (routine.progress || 0), 0)
            const averageProgress = routines.length > 0 ? Math.round(totalProgress / routines.length) : 0
            setOverallProgress(averageProgress)
          }

          if (user.id) {
            const { data: ratingData, error: ratingError } = await supabase
              .from("gym_ratings")
              .select("rating")
              .eq("user_id", user.id)
              .single()

            if (ratingError && ratingError.code !== "PGRST116") {
              console.error("Error fetching gym rating:", ratingError)
            } else if (ratingData) {
              setGymRating(ratingData.rating)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getNextPaymentDate = (startDate: string) => {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + 1)
    return date.toISOString()
  }

  const handleRatingChange = async (newRating: number) => {
    if (!userData?.id) {
      console.error("Error: No se puede guardar la calificación - Usuario no identificado")
      alert("Error: No se puede guardar la calificación - Usuario no identificado")
      return
    }

    setGymRating(newRating)

    try {
      const { data: existingRating } = await supabase.from("gym_ratings").select().eq("user_id", userData.id).single()

      let result

      if (existingRating) {
        result = await supabase
          .from("gym_ratings")
          .update({
            rating: newRating,
            created_at: new Date().toISOString(),
          })
          .eq("user_id", userData.id)
      } else {
        result = await supabase.from("gym_ratings").insert({
          user_id: userData.id,
          rating: newRating,
          created_at: new Date().toISOString(),
        })
      }

      if (result.error) {
        console.error("Error de Supabase:", result.error)
        throw result.error
      }

      console.log("Calificación guardada exitosamente")
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error al guardar la calificación:", {
          message: error.message,
          details: error,
        })
        alert(`Error al guardar la calificación: ${error.message}`)
      } else {
        console.error("Error desconocido al guardar la calificación:", error)
        alert("Ocurrió un error desconocido al guardar la calificación")
      }
    }
  }

  return (
    <div className="grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto p-4 md:p-8">
      <Card className="col-span-1 md:col-span-2 bg-[#242424] border-0">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 rounded-full border-8 border-gray-700" />

              <svg className="w-full h-full transform -rotate-90">
                <circle
                  className="text-[#00FF00] stroke-current"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="transparent"
                  r="70"
                  cx="96"
                  cy="96"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 70}`,
                    strokeDashoffset: `${2 * Math.PI * 70 * (1 - overallProgress / 100)}`,
                    transition: "stroke-dashoffset 0.5s ease",
                  }}
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">{overallProgress}%</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white">Progreso de Rutinas</h3>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#242424] border-0">
        <CardHeader>
          <CardTitle className="text-white">MEMBRESIA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-white">
            <div>
              <p className="text-gray-400">TIPO</p>
              <p className="text-xl font-semibold">{userData?.membresia || "V.I.P"}</p>
            </div>
            <div>
              <p className="text-gray-400">FECHA DE INICIO</p>
              <p>{userData?.created_at ? formatDate(userData.created_at) : "--/--/----"}</p>
            </div>
            <div>
              <p className="text-gray-400">FECHA DE FIN</p>
              <p>{userData?.created_at ? formatDate(getNextPaymentDate(userData.created_at)) : "--/--/----"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#242424] border-0">
        <CardHeader>
          <CardTitle className="text-white">PAGOS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-gray-400">PROXIMO PAGO</p>
              <p className="text-white">
                {userData?.created_at ? formatDate(getNextPaymentDate(userData.created_at)) : "--/--/----"}
              </p>
            </div>
            <div>
              <p className="text-gray-400">MONTO</p>
              <p className="text-white">${membershipData?.price || 60}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2 bg-[#242424] border-0">
        <CardHeader>
          <CardTitle className="text-white">CALIFICA TU EXPERIENCIA EN EL GYM</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center">
            <Rating value={gymRating} onChange={handleRatingChange} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

