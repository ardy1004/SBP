/**
 * Shared conversion: API Property → Frontend Property format.
 * Dipakai oleh: Home.tsx, Properties.tsx, PropertyDetail.tsx, CategoryPage.tsx
 * Menghindari duplikasi 4 versi apiPropertyToCard yang berbeda.
 */
import { Property } from "@/data/properties";

const PLACEHOLDER_IMAGE = "https://images.salambumi.xyz/kost%20dijual%20jogja.webp";

/**
 * Convert API response property ke format PropertyCard.
 * Semua field API di-map ke interface Property yang dipakai frontend.
 */
export function apiToCardProperty(api: any): Property {
  return {
    id: api.id,
    listing_code: api.listing_code || "",
    title: api.title || "Properti",
    slug: api.slug || "",
    price: api.price || api.price_offer || api.price_rent || 0,
    old_price: api.old_price,
    purpose: api.purpose || "Dijual",
    type: api.property_type || "Rumah",
    location: api.location || `${api.district || ""}, ${api.city || ""}`.replace(/^,\s*/, "") || "",
    specs: {
      lt: api.land_area,
      lb: api.building_area,
      kt: api.bedrooms,
      km: api.bathrooms,
      lantai: api.floors,
    },
    images: api.images?.length
      ? api.images.map((i: any) => typeof i === "string" ? i : i.url)
      : api.image
        ? [api.image]
        : [PLACEHOLDER_IMAGE],
    badges: {
      is_premium: !!api.is_premium,
      is_featured: !!api.is_featured,
      is_hot: !!api.is_hot,
      is_sold: !!api.is_sold,
      is_choice: !!api.is_choice,
    },
    legalitas: api.legal_status || "",
    status_legalitas: api.ownership_status || "On Hand",
    province: api.province || "",
    city: api.city || "",
    district: api.district || "",
    village: api.village || "",
    address: api.address || "",
    land_area: api.land_area || 0,
    building_area: api.building_area || 0,
    front_width: api.front_width || 0,
    floors: api.floors || 1,
    bedrooms: api.bedrooms || 0,
    bathrooms: api.bathrooms || 0,
    legal_status: api.legal_status || "",
    legal_details: api.legal_details || "",
    bank_name: api.bank_name || null,
    outstanding_amount: api.outstanding_amount || null,
    distance_to_river: api.distance_to_river ?? null,
    distance_to_grave: api.distance_to_grave ?? null,
    distance_to_powerline: api.distance_to_powerline ?? null,
    road_width: api.road_width || 0,
    description: api.description || "",
    facilities: api.facilities
      ? (typeof api.facilities === "string" ? JSON.parse(api.facilities) : api.facilities)
      : [],
    selling_reason: api.selling_reason || "",
    google_maps_url: api.google_maps_url || "",
    video_url: api.video_url || null,
    kost_type: api.kost_type || undefined,
    views: api.views_count || 0,
  };
}
