"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { cn } from "@/src/lib/utils"

interface LazyMediaProps {
    src: string
    alt: string
    width?: number
    height?: number
    className?: string
    priority?: boolean
}

export function LazyMedia({
    src,
    alt,
    width,
    height,
    className,
    priority = false
}: LazyMediaProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [error, setError] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {

        if (priority) {
            setIsVisible(true)
            return
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true)
                        observer.disconnect()
                    }
                })
            },
            {
                rootMargin: "50px",
                threshold: 0.1
            }
        )

        if (containerRef.current) {
            observer.observe(containerRef.current)
        }

        return () => {
            observer.disconnect()
        }
    }, [priority])

    useEffect(() => {
        setIsLoaded(false)
        setError(false)
        if (!priority) {

        }
    }, [src, priority])

    if (!src) {
        return (
            <div
                className={cn("bg-muted animate-pulse", className)}
                style={{ width, height }}
            />
        )
    }

    return (
        <div
            ref={containerRef}
            className={cn("relative overflow-hidden bg-muted", className)}
        >
            {!isVisible ? (

                <div className="absolute inset-0 bg-muted" />
            ) : (

                <>
                    <Image
                        src={src}
                        alt={alt}
                        width={width || 600}
                        height={height || 400}
                        className={cn(
                            "w-full h-full object-cover transition-opacity duration-500",
                            isLoaded ? "opacity-100" : "opacity-0"
                        )}
                        onLoad={() => setIsLoaded(true)}
                        onError={() => setError(true)}
                        unoptimized={true}
                    />

                    {!isLoaded && !error && (
                        <div className="absolute inset-0 bg-muted animate-pulse" />
                    )}

                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm p-4 text-center">
                            Failed to load image
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
