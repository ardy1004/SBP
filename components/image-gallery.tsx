"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "@/components/icons"

interface ImageGalleryProps {
  images: string[]
  title: string
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToNext = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goToPrevious()
    if (e.key === "ArrowRight") goToNext()
    if (e.key === "Escape") setIsFullscreen(false)
  }

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div
          className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden cursor-pointer bg-muted"
          onClick={() => setIsFullscreen(true)}
        >
          <Image
            src={images[selectedIndex] || "/placeholder.svg"}
            alt={`${title} - Image ${selectedIndex + 1}`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-md text-sm backdrop-blur-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnail Grid */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  index === selectedIndex
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-muted-foreground/30"
                }`}
              >
                <Image src={image || "/placeholder.svg"} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            onClick={() => setIsFullscreen(false)}
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
            {selectedIndex + 1} / {images.length}
          </div>

          {/* Image */}
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[selectedIndex] || "/placeholder.svg"}
              alt={`${title} - Image ${selectedIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
