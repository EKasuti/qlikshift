"use client"

import { PublicNav } from '@/components/public-nav'
import { QlikCard } from '@/components/ui/card'
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { MousePointerClick, Users } from "lucide-react"

const assignments = [
  { student: "Danny", department: "Library", shift: "Morning", desk: "Jmc" },
  { student: "Sam", department: "Library", shift: "Afternoon", desk: "Jmc" },
  { student: "Chris", department: "Library", shift: "Evening", desk: "Circ" },
  { student: "Natalie", department: "Library", shift: "Morning", desk: "Orozco" },
  { student: "Evan", department: "Library", shift: "Afternoon", desk: "Baker" },
]

// Utility for coloring by shift
function getShiftColor(shift: string) {
  switch (shift) {
    case "Morning":
      return "text-emerald-500"
    case "Afternoon":
      return "text-yellow-500"
    case "Evening":
      return "text-purple-500"
    default:
      return "text-gray-500"
  }
}

// Map assignments to features
const features = assignments.map((assignment) => ({
  icon: Users,
  text: `${assignment.student} — ${assignment.shift} shift at ${assignment.desk} (${assignment.department})`,
  color: getShiftColor(assignment.shift),
}))

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [time, setTime] = useState<string>("")
  const [date, setDate] = useState<string>("")

  // Rotate through features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const currentFeature = features[currentIndex]
  const Icon = currentFeature.icon

  // Live clock + date
  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      )
      setDate(
        new Date().toLocaleDateString([], {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      )
    }
    update()
    const interval = setInterval(update, 60_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen scroll-smooth bg-black dark:bg-dark-background">
      <PublicNav />

      <main className="pt-16">
        {/* Hero Section */}
        <section
          id="home"
          className="grid grid-cols-1 md:grid-cols-[380px_1fr_380px] h-auto md:h-[calc(100vh-4rem)] relative overflow-hidden"
        >
          <QlikCard>
            <div className="p-8">
              <p className="text-sm mb-2">
                QlikShift streamlines shift assignments for modern teams. Smarter. 
                Faster. Connected. Empower your team, eliminate scheduling chaos, and cut admin work 
                with a platform built for flexibility and scale.
              </p>
            </div>
          </QlikCard>

          <QlikCard
            rounded="rounded-[24px] md:rounded-l-[24px] md:rounded-tr-[24px] md:rounded-br-[100px]"
            className="relative overflow-hidden flex items-center justify-center shadow-xl min-h-[400px] sm:min-h-[600px]"
          >
            {/* Animated background glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-500 opacity-30"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Rotating assignment cards */}
            <div className="relative z-10 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Icon
                      className={`w-40 h-40 ${currentFeature.color} drop-shadow-xl`}
                    />
                  </motion.div>

                  <p className="text-lg md:text-xl font-medium text-gray-700 dark:text-gray-300 mt-4">
                    {currentFeature.text}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </QlikCard>

          <QlikCard>
            <div className="flex flex-col p-8 md:p-12">
              {/* Top - brand */}
              <div className="flex items-center gap-2 mb-6">
                <MousePointerClick className="h-6 w-6 text-accent" />
              </div>

              {/* Clock + Date */}
              <div className="text-left">
                <p className="text-2xl md:text-4xl">{time}</p>
                <p className="text-sm text-gray-500">{date}</p>
              </div>
            </div>
          </QlikCard>
        </section>
      </main>
    </div>
  )
}
