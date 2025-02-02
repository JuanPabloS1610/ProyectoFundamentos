"use client"

import { User, BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"

export default function AdminPage() {
  const router = useRouter()

  return (
    <div className="flex-1 bg-[#1a1a1a] min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-12">ADMINISTRADOR</h1>

        <div className="grid grid-cols-2 gap-8">
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full">
                <div className="bg-[#242424] p-8 rounded-lg border border-[#333] hover:border-[#444] transition-colors">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-lg bg-[#242424] border border-green-500 flex items-center justify-center">
                      <User className="w-12 h-12 text-green-500" />
                    </div>
                    <span className="text-gray-400">Administrador de usuarios</span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[240px] bg-[#242424] border-[#333] text-white">
                <DropdownMenuItem
                  className="hover:bg-[#333] cursor-pointer"
                  onClick={() => router.push("/users/create")}
                >
                  Ingresar nuevo usuario
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-[#333] cursor-pointer" onClick={() => router.push("/users")}>
                  Consultar usuarios
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full">
                <div className="bg-[#242424] p-8 rounded-lg border border-[#333] hover:border-[#444] transition-colors">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-lg bg-[#242424] border border-purple-500 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-purple-500" />
                    </div>
                    <span className="text-gray-400">Administrador de Membresias</span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[240px] bg-[#242424] border-[#333] text-white">
                <DropdownMenuItem
                  className="hover:bg-[#333] cursor-pointer"
                  onClick={() => router.push("/memberships/create")}
                >
                  Nueva membresía
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="hover:bg-[#333] cursor-pointer"
                  onClick={() => router.push("/memberships")}
                >
                  Consultar membresías
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}

