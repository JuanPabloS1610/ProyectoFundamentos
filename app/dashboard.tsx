"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Line } from "react-chartjs-2"
import { Bar } from "react-chartjs-2"
import { Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

const weeklyData = {
  labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6", "Sem 7"],
  datasets: [
    {
      label: "Línea 1",
      data: [100, 75, 85, 90, 75, 85, 90],
      borderColor: "#9333ea",
      tension: 0.4,
    },
    {
      label: "Línea 2",
      data: [90, 85, 75, 85, 90, 75, 95],
      borderColor: "#22c55e",
      tension: 0.4,
    },
  ],
}

export default function Dashboard() {
  const [userType, setUserType] = useState<string>("")
  const [monthlyData, setMonthlyData] = useState<number[]>(new Array(12).fill(0))
  const [reviewsData, setReviewsData] = useState({
    labels: ["Excelente", "Bueno", "Regular", "Malo", "Pésimo"],
    datasets: [
      {
        data: [0, 0, 0, 0, 0],
        backgroundColor: ["#22c55e", "#3b82f6", "#9333ea", "#f59e0b", "#ef4444"],
        borderWidth: 0,
      },
    ],
  })

  useEffect(() => {
    setUserType(localStorage.getItem("userType") || "")
    fetchRatings()
    fetchMonthlyRegistrations()
  }, [])

  const fetchMonthlyRegistrations = async () => {
    try {
      const { data, error } = await supabase.from("users").select("created_at").eq("user_type", "Cliente")

      if (error) throw error

      const registrationsByMonth = new Array(12).fill(0)

      data.forEach((user) => {
        const date = new Date(user.created_at)
        const month = date.getMonth() // 0-11
        registrationsByMonth[month]++
      })

      setMonthlyData(registrationsByMonth)
    } catch (error) {
      console.error("Error fetching monthly registrations:", error)
    }
  }

  const fetchRatings = async () => {
    const { data, error } = await supabase.from("gym_ratings").select("rating")

    if (error) {
      console.error("Error fetching ratings:", error)
      return
    }

    const ratingCounts = [0, 0, 0, 0, 0]
    data.forEach((rating: { rating: number }) => {
      ratingCounts[5 - rating.rating]++
    })

    setReviewsData((prevData) => ({
      ...prevData,
      datasets: [
        {
          ...prevData.datasets[0],
          data: ratingCounts,
        },
      ],
    }))
  }

  const getDashboardTitle = () => {
    switch (userType) {
      case "Cliente":
        return "PANEL DE CLIENTE"
      case "Entrenador":
        return "PANEL DE ENTRENADOR"
      default:
        return "DASHBOARD GYM"
    }
  }

  return (
    <div className="flex-1 bg-[#1a1a1a]">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">{getDashboardTitle()}</h1>
        </div>

        {/* Monthly Subscriptions */}
        <Card className="bg-[#242424] border-0 mb-6">
          <CardHeader className="pb-0">
            <CardTitle className="text-white">Subscripciones mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar
              data={{
                labels: months,
                datasets: [
                  {
                    data: monthlyData,
                    backgroundColor: "#9333ea",
                    borderRadius: 4,
                    barThickness: 40,
                  },
                ],
              }}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: Math.max(...monthlyData) + 5, 
                    ticks: {
                      stepSize: 5,
                      color: "#666",
                    },
                    grid: {
                      color: "#333",
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      color: "#666",
                    },
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
              height={100}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <Card className="bg-[#242424] border-0">
            <CardHeader className="pb-0">
              <CardTitle className="text-white">Ganancias semanales</CardTitle>
            </CardHeader>
            <CardContent>
              <Line
                data={weeklyData}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        stepSize: 25,
                        color: "#666",
                      },
                      grid: {
                        color: "#333",
                      },
                    },
                    x: {
                      grid: {
                        color: "#333",
                      },
                      ticks: {
                        color: "#666",
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </CardContent>
          </Card>

          <Card className="bg-[#242424] border-0">
            <CardHeader className="pb-0">
              <CardTitle className="text-white">Reseñas</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="w-[300px]">
                <Doughnut
                  data={reviewsData}
                  options={{
                    responsive: true,
                    cutout: "70%",
                    plugins: {
                      legend: {
                        position: "right" as const,
                        labels: {
                          color: "#fff",
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#242424] border-0">
          <CardHeader className="pb-0">
            <CardTitle className="text-white">Ubicación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.7602656865097!2d-78.14419792396876!3d-0.2631195994537566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d547b428e0a6e7%3A0x8c6d0f7e6d02a7ef!2sGym%20Fitness%20Club%20Sangolqu%C3%AD!5e0!3m2!1ses!2sec!4v1706595305443!5m2!1ses!2sec"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

