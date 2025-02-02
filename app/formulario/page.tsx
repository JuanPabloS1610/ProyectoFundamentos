"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Button } from "../../components/ui/button"
import { supabase } from "../../lib/supabaseClient"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"

interface Payment {
  id: string
  payment_id: string
  identification: string
  customer_name: string
  status: string
  amount: number
  payment_method: string
  created_at: string
  last_four?: string
}

export default function FormularioPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchPayments()
  }, [currentPage]) 

  const fetchPayments = async () => {
    let query = supabase.from("payments").select("*").order("created_at", { ascending: false })

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter)
    }

    if (methodFilter !== "all") {
      query = query.eq("payment_method", methodFilter)
    }

    if (searchQuery) {
      query = query.ilike("identification", `%${searchQuery}%`)
    }

    const { data, error } = await query.range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

    if (error) {
      console.error("Error fetching payments:", error)
      return
    }

    setPayments(data || [])
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500/20 text-green-500"
      case "pending":
        return "bg-yellow-500/20 text-yellow-500"
      case "declined":
        return "bg-red-500/20 text-red-500"
      default:
        return "bg-gray-500/20 text-gray-500"
    }
  }

  const formatPaymentMethod = (method: string, lastFour?: string) => {
    switch (method.toLowerCase()) {
      case "stripe":
        return `Tarjeta ${lastFour ? `•••• ${lastFour}` : ""}`
      case "transfer":
        return "Transferencia bancaria"
      default:
        return method
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex-1 p-8 bg-[#1a1a1a]">
      <Card className="bg-[#242424] border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Facturación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-[#333] border-0 text-white">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="bg-[#333] border-0">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="pending">En proceso</SelectItem>
                <SelectItem value="declined">Rechazado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-[180px] bg-[#333] border-0 text-white">
                <SelectValue placeholder="Método de pago" />
              </SelectTrigger>
              <SelectContent className="bg-[#333] border-0">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="stripe">Tarjeta</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Buscar por identificación"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#333] border-0 text-white"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-400">ID DE PAGO</TableHead>
                <TableHead className="text-gray-400">IDENTIFICACIÓN</TableHead>
                <TableHead className="text-gray-400">NOMBRE</TableHead>
                <TableHead className="text-gray-400">ESTADO</TableHead>
                <TableHead className="text-gray-400">MONTO</TableHead>
                <TableHead className="text-gray-400">MÉTODO</TableHead>
                <TableHead className="text-gray-400">FECHA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id} className="border-gray-800">
                  <TableCell className="text-gray-300">{payment.payment_id}</TableCell>
                  <TableCell className="text-gray-300">{payment.identification}</TableCell>
                  <TableCell className="text-gray-300">{payment.customer_name}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(payment.status)}`}
                    >
                      {payment.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-300">${payment.amount.toFixed(2)} USD</TableCell>
                  <TableCell className="text-gray-300">
                    {formatPaymentMethod(payment.payment_method, payment.last_four)}
                  </TableCell>
                  <TableCell className="text-gray-300">{formatDate(payment.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-400">{payments.length} resultados</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-[#333] border-0 text-white hover:bg-[#444]"
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={payments.length < itemsPerPage}
                className="bg-[#333] border-0 text-white hover:bg-[#444]"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

