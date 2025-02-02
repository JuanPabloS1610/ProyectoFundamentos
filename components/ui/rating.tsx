"use client"
import { Star } from "lucide-react"

interface RatingProps {
  value: number
  onChange: (value: number) => void
}

const ratingLabels = ["Pésimo", "Malo", "Normal", "Bueno", "Muy Bueno"]

export function Rating({ value, onChange }: RatingProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            className={`text-2xl focus:outline-none ${rating <= value ? "text-yellow-400" : "text-gray-400"}`}
            onClick={() => onChange(rating)}
          >
            <Star className="w-8 h-8" fill={rating <= value ? "currentColor" : "none"} />
          </button>
        ))}
      </div>
      {value > 0 && <p className="mt-2 text-white">{ratingLabels[value - 1]}</p>}
    </div>
  )
}

