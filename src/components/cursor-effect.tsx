"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function CursorEffect() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    window.addEventListener("mousemove", handleMouseMove)
    document.body.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.body.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <>
      <motion.div
        className="cursor-dot fixed w-6 h-6 rounded-full bg-primary pointer-events-none z-50 opacity-30"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
          opacity: isVisible ? 0.3 : 0,
        }}
        transition={{ type: "spring", damping: 20, stiffness: 300, mass: 0.5 }}
      />
      <motion.div
        className="cursor-dot fixed w-3 h-3 rounded-full bg-white pointer-events-none z-50"
        animate={{
          x: mousePosition.x - 6,
          y: mousePosition.y - 6,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 500, mass: 0.2 }}
      />
    </>
  )
}
