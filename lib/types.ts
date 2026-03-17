export type PropertyType = "apartment" | "gudang" | "villa" | "homestay/guesthouse" | "hotel" | "kost" | "rumah" | "ruko" | "tanah" | "bangunan_komersial"
export type PropertyStatus = "sale" | "rent"
export type PropertyCondition = "new" | "good" | "fair" | "renovation"

export interface Property {
  id: string
  kodeListing: string
  title: string
  description: string
  type: PropertyType
  status: PropertyStatus
  price: number
  priceOld?: number | null
  location: {
    address: string
    city: string
    province: string
    district: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  specifications: {
    landArea: number // m²
    buildingArea: number // m²
    bedrooms: number
    bathrooms: number
    floors: number
    carports: number
    electricity: number // watts
    waterSource: string
    condition: PropertyCondition
    certificate: string
    furnishing: "unfurnished" | "semi-furnished" | "fully-furnished"
  }
  facilities: string[]
  images: string[]
  featured: boolean
  isPremium: boolean
  isHot: boolean
  isSold: boolean
  isPropertyPilihan: boolean
  ownerContact?: string
  agent: {
    id: string
    name: string
    phone: string
    whatsapp: string
    email: string
    photo: string
  }
  createdAt: string
  updatedAt: string
  views: number
}

export interface SearchFilters {
  type?: PropertyType
  status?: PropertyStatus
  province?: string
  city?: string
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  minBathrooms?: number
  minLandArea?: number
  minBuildingArea?: number
  query?: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  propertyId?: string
  createdAt: string
  status: "new" | "read" | "replied"
}

export interface CompanyInfo {
  name: string
  slogan: string
  about: string
  vision: string
  mission: string[]
  address: string
  phone: string
  whatsapp: string
  email: string
  socialMedia: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
}
