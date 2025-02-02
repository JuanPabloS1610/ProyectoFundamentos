"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Plus } from "lucide-react"
import { supabase } from "../../../lib/supabaseClient"
import { uploadProfileImage } from "../../../lib/image-upload"

interface UserProfile {
  nombre: string
  cedula: string
  correo: string
  foto_url?: string
  specialties?: string[]
  philosophy?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState<UserProfile>({
    nombre: "",
    cedula: "",
    correo: "",
    specialties: [],
    philosophy: "", 
  })
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isCoach, setIsCoach] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const userEmail = localStorage.getItem("userEmail")
      const userType = localStorage.getItem("userType") 
      console.log("Current user type:", userType) 
      if (!userEmail) return

      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, nombre, cedula, correo, foto_url, user_type")
          .eq("correo", userEmail)
          .single()

        if (userError) throw userError

        if (userData) {
          const userType = localStorage.getItem("userType")
          setIsCoach(userData.user_type === "Entrenador" || userType === "Entrenador")
          const profileData: UserProfile = {
            nombre: userData.nombre,
            cedula: userData.cedula,
            correo: userData.correo,
            foto_url: userData.foto_url,
          }

          if (userData.foto_url) {
            setPreviewUrl(userData.foto_url)
          }

          if (userData.user_type === "Entrenador") {
            const { data: coachData } = await supabase
              .from("coaches")
              .select("specialties, philosophy")
              .eq("user_id", userData.id)
              .single()

            console.log("Coach data:", coachData) 

            if (coachData) {
              profileData.specialties = coachData.specialties
              profileData.philosophy = coachData.philosophy || "" 
            }
          }

          setProfile(profileData)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      }
    }

    fetchProfile()
  }, [])

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      const publicUrl = await uploadProfileImage(file)
      setProfile((prev) => ({ ...prev, foto_url: publicUrl }))
    } catch (error) {
      console.error("Error handling image:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const userEmail = localStorage.getItem("userEmail")
    if (!userEmail) return

    try {
      const { data: userData } = await supabase.from("users").select("id").eq("correo", userEmail).single()

      if (!userData) throw new Error("User not found")

      const { error: userError } = await supabase
        .from("users")
        .update({
          nombre: profile.nombre,
          cedula: profile.cedula,
          correo: profile.correo,
          foto_url: profile.foto_url,
        })
        .eq("id", userData.id)

      if (userError) throw userError

      if (isCoach) {
        const { error: coachError } = await supabase
          .from("coaches")
          .update({
            specialties: profile.specialties,
            philosophy: profile.philosophy,
          })
          .eq("user_id", userData.id)

        if (coachError) throw coachError
      }

      if (profile.correo !== userEmail) {
        localStorage.setItem("userEmail", profile.correo)
      }

      router.push("/settings")
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  return (
    <div className="flex-1 min-h-screen bg-[#1a1a1a] p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">Editar Perfil</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#00FF00] mb-2">Nombre</label>
            <Input
              value={profile.nombre}
              onChange={(e) => setProfile({ ...profile, nombre: e.target.value })}
              className="bg-white border-0 text-black"
              required
            />
          </div>

          <div>
            <label className="block text-[#00FF00] mb-2">Cedula</label>
            <Input
              value={profile.cedula}
              onChange={(e) => setProfile({ ...profile, cedula: e.target.value })}
              className="bg-white border-0 text-black"
              required
            />
          </div>

          <div>
            <label className="block text-[#00FF00] mb-2">Correo electrónico</label>
            <Input
              type="email"
              value={profile.correo}
              onChange={(e) => setProfile({ ...profile, correo: e.target.value })}
              className="bg-white border-0 text-black"
              required
            />
          </div>

          {isCoach && (
            <>
              <div>
                <label className="block text-[#00FF00] mb-2">Especialidades</label>
                <Input
                  value={profile.specialties?.join(", ")}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      specialties: e.target.value.split(",").map((s) => s.trim()),
                    })
                  }
                  className="bg-white border-0 text-black"
                  placeholder="Separadas por comas"
                />
              </div>

              <div>
                <label className="block text-[#00FF00] mb-2">Filosofía de entrenamiento</label>
                <Textarea
                  value={profile.philosophy || ""}
                  onChange={(e) => setProfile({ ...profile, philosophy: e.target.value })}
                  className="bg-white border-0 text-black min-h-[100px]"
                  placeholder="Describe tu filosofía de entrenamiento"
                />
              </div>
            </>
          )}

          <div className="flex justify-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/png,image/jpeg"
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              onClick={handleImageClick}
              className="w-32 h-32 rounded-lg relative overflow-hidden"
            >
              {previewUrl ? (
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Profile preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-purple-500">
                  <Plus className="h-12 w-12 text-purple-500" />
                </div>
              )}
            </Button>
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1 bg-[#00FF00] text-black hover:bg-[#00DD00]">
              Guardar
            </Button>
            <Button
              type="button"
              className="flex-1 bg-red-500 hover:bg-red-600"
              onClick={() => router.push("/settings")}
            >
              Volver
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

