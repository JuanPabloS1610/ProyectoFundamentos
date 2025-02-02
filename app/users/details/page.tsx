"use client";

import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserData {
  nombre: string;
  cedula: string;
  correo: string;
  membresia: string;
}

export default function UserDetails() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("newUserData");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData && parsedData.nombre && parsedData.cedula) {
          setUserData(parsedData);
        } else {
          throw new Error("Datos inválidos");
        }
      } catch {
        sessionStorage.removeItem("newUserData");
        router.push("/users");
      }
    } else {
      router.push("/users");
    }
  }, [router]);

  if (!userData) {
    return (
      <div className="flex-1 min-h-screen bg-[#1a1a1a] p-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-white">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-[#1a1a1a] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">Usuario</h1>

        <div className="bg-[#242424] rounded-lg p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <div className="bg-[#9333ea] p-4 rounded-md">
                <h3 className="text-white">Nombres</h3>
                <p className="text-white/90 mt-1">{userData.nombre}</p>
              </div>
            </div>

            <div>
              <div className="bg-[#9333ea] p-4 rounded-md">
                <h3 className="text-white">Cedula</h3>
                <p className="text-white/90 mt-1">{userData.cedula}</p>
              </div>
            </div>

            <div>
              <div className="bg-[#9333ea] p-4 rounded-md">
                <h3 className="text-white">Correo</h3>
                <p className="text-white/90 mt-1">{userData.correo}</p>
              </div>
            </div>

            <div>
              <div className="bg-[#9333ea] p-4 rounded-md">
                <h3 className="text-white">Membresia</h3>
                <p className="text-white/90 mt-1">{userData.membresia}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#242424] border-2 border-green-500 flex items-center justify-center">
                <User className="w-8 h-8 text-green-500" />
              </div>
              <span className="text-white">QR Acceso</span>
            </div>
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-W4to0M4P24PUY0fWj3Bk5lc3kRjvaz.png"
              alt="QR Code"
              className="w-32 h-32"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
