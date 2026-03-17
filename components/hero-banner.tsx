"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, MapPin, Bed, Bath, Maximize } from "@/components/icons"
import { Button } from "@/components/ui/button"
import type { Property } from "@/lib/types"
import { formatPrice } from "@/lib/data"

interface HeroBannerProps {
  properties: Property[]
}

export function HeroBanner({ properties }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying || properties.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % properties.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, properties.length])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + properties.length) % properties.length)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % properties.length)
  }

  if (properties.length === 0) return null

  const currentProperty = properties[currentIndex]

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-xl bg-muted">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={currentProperty.images[0] || "/placeholder.svg"}
          alt={currentProperty.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6 md:p-12">
        <div className="max-w-3xl space-y-4">
          {/* Featured Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Properti Pilihan
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-white text-balance">{currentProperty.title}</h1>

          {/* Location */}
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="h-5 w-5" />
            <span className="text-lg">
              {currentProperty.location.city}, {currentProperty.location.province}
            </span>
          </div>

          {/* Specifications */}
          <div className="flex flex-wrap items-center gap-4 text-white/90">
            {currentProperty.specifications.bedrooms > 0 && (
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                <span>{currentProperty.specifications.bedrooms} KT</span>
              </div>
            )}
            {currentProperty.specifications.bathrooms > 0 && (
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5" />
                <span>{currentProperty.specifications.bathrooms} KM</span>
              </div>
            )}
            {currentProperty.specifications.landArea > 0 && (
              <div className="flex items-center gap-2">
                <Maximize className="h-5 w-5" />
                <span>{currentProperty.specifications.landArea} m²</span>
              </div>
            )}
          </div>

          {/* Price and CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
            <div className="text-3xl md:text-4xl font-bold text-white">{formatPrice(currentProperty.price)}</div>
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link href={`/properties/${currentProperty.id}`}>Lihat Detail</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {properties.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {properties.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {properties.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                setIsAutoPlaying(false)
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
