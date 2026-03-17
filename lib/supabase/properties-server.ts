import { getSupabaseServerClient } from "./server"
import type { Property } from "@/lib/types"

// Map Supabase data to our Property type
function mapSupabaseToProperty(data: any): Property {
  const images = [data.image_url, data.image_url1, data.image_url2, data.image_url3, data.image_url4].filter(Boolean)

  let status: "sale" | "rent" = "sale"
  if (data.status) {
    if (data.status.toLowerCase() === "disewakan" || data.status.toLowerCase() === "rent") {
      status = "rent"
    }
  }

  let propertyType = "house"
  if (data.jenis_properti) {
    const jenisLower = data.jenis_properti.toLowerCase()
    if (jenisLower.includes("rumah")) propertyType = "house"
    else if (jenisLower.includes("apartemen") || jenisLower.includes("apartment")) propertyType = "apartment"
    else if (jenisLower.includes("tanah") || jenisLower.includes("land")) propertyType = "land"
    else if (jenisLower.includes("komersial") || jenisLower.includes("commercial") || jenisLower.includes("ruko"))
      propertyType = "commercial"
    else if (jenisLower.includes("villa")) propertyType = "villa"
    else propertyType = jenisLower
  }

  return {
    id: data.id || "",
    kodeListing: data.kode_listing || "",
    title: data.judul_properti || "",
    description: data.deskripsi || "",
    type: propertyType as any,
    status: status,
    price: data.harga_properti || 0,
    priceOld: data.price_old || null,
    location: {
      address: "",
      city: data.kabupaten || "",
      province: data.provinsi || "",
      district: "",
      coordinates: undefined,
    },
    specifications: {
      landArea: data.luas_tanah || 0,
      buildingArea: data.luas_bangunan || 0,
      bedrooms: Number(data.kamar_tidur) || 0,
      bathrooms: Number(data.kamar_mandi) || 0,
      floors: 1,
      carports: 0,
      electricity: 0,
      waterSource: "PDAM",
      condition: "good",
      certificate: data.legalitas || "",
      furnishing: "unfurnished",
    },
    facilities: [],
    images: images,
    featured: data.is_featured || false,
    isPremium: data.is_premium || false,
    isHot: data.is_hot || false,
    isSold: data.is_sold || false,
    isPropertyPilihan: data.is_property_pilihan || false,
    ownerContact: data.owner_contact || undefined,
    agent: {
      id: "default-agent",
      name: "Salam Bumi Property",
      phone: "081391278889",
      whatsapp: "+6281391278889",
      email: "info@salambumi.xyz",
      photo: "/business-agent.png",
    },
    createdAt: data.created_at || new Date().toISOString(),
    updatedAt: data.updated_at || new Date().toISOString(),
    views: 0,
  }
}

export async function getProperties(): Promise<Property[]> {
  try {
    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching properties:", error)
      return []
    }

    return (data || []).map(mapSupabaseToProperty)
  } catch (error) {
    console.error("[v0] Error in getProperties:", error)
    return []
  }
}

export async function getPropertyById(id: string): Promise<Property | null> {
  try {
    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase.from("properties").select("*").eq("id", id).single()

    if (error || !data) {
      console.error("[v0] Error fetching property:", error)
      return null
    }

    return mapSupabaseToProperty(data)
  } catch (error) {
    console.error("[v0] Error in getPropertyById:", error)
    return null
  }
}

export async function getFeaturedProperties(): Promise<Property[]> {
  try {
    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("is_property_pilihan", true)
      .order("created_at", { ascending: false })
      .limit(6)

    if (error) {
      console.error("[v0] Error fetching featured properties:", error)
      return []
    }

    return (data || []).map(mapSupabaseToProperty)
  } catch (error) {
    console.error("[v0] Error in getFeaturedProperties:", error)
    return []
  }
}