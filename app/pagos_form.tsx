'use client';

import { useState } from 'react';
import { CreditCard, Home, Package, Settings, User, Users } from 'lucide-react';
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';

export default function PaymentForm() {
  const router = useRouter();
  const [showQR, setShowQR] = useState(false);

  const handleTransferClick = () => {
    router.push('/transfer-details');
  };

  const toggleQR = () => {
    setShowQR(!showQR);
  };

  return (
    <div className="flex min-h-screen bg-[#1a1a1a]">
      <div className="w-20 bg-[#1a1a1a] border-r border-gray-800 flex flex-col items-center py-6 gap-8">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-green-500" />
        <nav className="flex flex-col gap-6">
          <Button variant="ghost" size="icon" className="text-gray-400">
            <Home className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400">
            <User className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400">
            <Package className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400">
            <Users className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400">
            <Settings className="h-6 w-6" />
          </Button>
        </nav>
      </div>

      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-8">
          <Card className="bg-[#242424] border-0">
            <CardContent className="p-6 space-y-4">
              <Input
                placeholder="Ingrese número de cédula"
                className="bg-[#1a1a1a] border-0 text-white"
              />
              <Input
                placeholder="Nombres"
                className="bg-[#9333ea] border-0 text-white placeholder:text-white"
              />
              <Input
                placeholder="Cédula"
                className="bg-[#9333ea] border-0 text-white placeholder:text-white"
              />
              <Input
                placeholder="Correo"
                className="bg-[#9333ea] border-0 text-white placeholder:text-white"
              />
              <Input
                placeholder="Membresía"
                className="bg-[#9333ea] border-0 text-white placeholder:text-white"
              />

              <div className="flex justify-center mt-8">
                <div className="text-center">
                  <div
                    className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-2 cursor-pointer"
                    onClick={toggleQR} 
                  >
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white">QR Acceso</span>
                </div>
              </div>

              {showQR && (
                <div className="flex justify-center mt-4">
                  <QRCodeCanvas
                    value="https://example.com/acceso"
                    size={128}
                    bgColor="#1a1a1a"
                    fgColor="#ffffff"
                  />
                </div>
              )}

              <div className="flex justify-center mt-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-2">
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-white">Cobrar</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h2 className="text-2xl text-white mb-8">Seleccione el método de pago</h2>
            <div className="grid gap-4">
              <Button
                variant="outline"
                className="w-full justify-start gap-4 text-lg h-16 bg-black hover:bg-gray-100"
                onClick={() => router.push('/stripe-payment')}
              >
                <CreditCard className="w-6 h-6" />
                Tarjeta
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-4 text-lg h-16 bg-black hover:bg-gray-100"
              >
                <Package className="w-6 h-6" />
                Efectivo
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-4 text-lg h-16 bg-black hover:bg-gray-100"
                onClick={handleTransferClick}
              >
                <Package className="w-6 h-6" />
                Transferencia
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
