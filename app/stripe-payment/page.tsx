"use client"

import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { useState } from "react"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { supabase } from "../../lib/supabaseClient"
import { useRouter } from "next/navigation"
import type React from "react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "")

const CheckoutForm = () => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) return

    setLoading(true)

    const cardElement = elements.getElement(CardElement)

    const response = await fetch("/api/stripe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 1, currency: "usd" }),
    })

    const { clientSecret } = await response.json()

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement!,
        billing_details: { email },
      },
    })

    if (error) {
      alert(`Error: ${error.message}`)
    } else if (paymentIntent?.status === "succeeded") {
      const userEmail = localStorage.getItem("userEmail")
      const { data: userData } = await supabase
        .from("users")
        .select("id, nombre, cedula")
        .eq("correo", userEmail)
        .single()

      if (userData) {
        const { error: paymentError } = await supabase.from("payments").insert({
          payment_id: paymentIntent.id,
          user_id: userData.id,
          identification: userData.cedula,
          customer_name: userData.nombre,
          status: "completed",
          amount: paymentIntent.amount / 100,
          payment_method: "stripe",
          receipt_url: paymentIntent.charges.data[0]?.receipt_url,
          last_four: paymentIntent.charges.data[0]?.payment_method_details?.card?.last4,
          currency: paymentIntent.currency.toUpperCase(),
        })

        if (paymentError) {
          console.error("Error recording payment:", paymentError)
        } else {
          alert("¡Pago realizado con éxito!")
          router.push("/dashboard")
        }
      }
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div className="space-y-4">
        <Input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-[#333] border-0 text-white"
        />
        <div className="bg-[#333] p-4 rounded-md">
          <CardElement
            options={{
              hidePostalCode: true,
              style: {
                base: {
                  fontSize: "16px",
                  color: "#ffffff",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
              },
            }}
          />
        </div>
      </div>
      <Button type="submit" disabled={!stripe || loading} className="w-full bg-purple-600 hover:bg-purple-700">
        {loading ? "Procesando..." : "Pagar $1.00"}
      </Button>
    </form>
  )
}

export default function StripePayment() {
  return (
    <div className="flex-1 min-h-screen bg-[#1a1a1a] p-8">
      <Card className="max-w-2xl mx-auto bg-[#242424] border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Pago con tarjeta</CardTitle>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        </CardContent>
      </Card>
    </div>
  )
}

