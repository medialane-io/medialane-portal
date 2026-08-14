"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ConfettiProps {
  duration?: number;
  particleCount?: number;
}

const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];

interface Particle {
  id: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
}

export const Confetti = ({ duration = 3000, particleCount = 100 }: ConfettiProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {

    const newParticles = Array.from({ length: particleCount }).map((_, i) => {
      const angle = Math.random() * 360;
      const distance = 100 + Math.random() * 400;

      const tx = Math.cos((angle * Math.PI) / 180) * distance;
      const ty = Math.sin((angle * Math.PI) / 180) * distance;

      return {
        id: i,
        x: 50,
        y: 50,
        tx: tx,
        ty: ty,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random(),
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.2,
      };
    });
    setParticles(newParticles);
  }, [particleCount]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 0,
          }}
          animate={{
            x: particle.tx,
            y: particle.ty,
            opacity: 0,
            scale: particle.scale,
            rotate: particle.rotation + 720,
          }}
          transition={{
            duration: duration / 1000,
            ease: [0.25, 0.1, 0.25, 1],
            delay: particle.delay,
          }}
          style={{
            position: "absolute",
            width: "12px",
            height: "12px",
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
};
