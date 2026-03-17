import { useState, useEffect } from 'react';

interface HeroImage {
  id: number;
  webpSrc: string;
  jpgSrc: string;
  title: string;
  alt: string;
}

const heroImages: HeroImage[] = [
  {
    id: 1,
    webpSrc: '/images/hero-1.webp',
    jpgSrc: '/images/hero-1.jpg',
    title: 'Luxury Villa Collection',
    alt: 'Beautiful luxury villa with modern architecture'
  },
  {
    id: 2,
    webpSrc: '/images/hero-2.webp',
    jpgSrc: '/images/hero-2.jpg',
    title: 'Premium Urban Living',
    alt: 'Modern urban apartment complex'
  },
  {
    id: 3,
    webpSrc: '/images/hero-3.webp',
    jpgSrc: '/images/hero-3.jpg',
    title: 'Commercial Excellence',
    alt: 'Professional commercial building'
  },
  {
    id: 4,
    webpSrc: '/images/hero-4.webp',
    jpgSrc: '/images/hero-4.jpg',
    title: 'Heritage Properties',
    alt: 'Classic heritage property with modern amenities'
  }
];

export function useHeroRotation(intervalMs: number = 8000) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % heroImages.length
      );
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  const currentImage = heroImages[currentImageIndex];

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Fallback to external image if local images fail
    const target = e.currentTarget;
    target.src = 'https://images.salambumi.xyz/asset/Ultrarealistic_luxury_modern_202512141800.webp';
  };

  return {
    currentImage,
    isLoaded,
    handleImageLoad,
    handleImageError,
    allImages: heroImages
  };
}