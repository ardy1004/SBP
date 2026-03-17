import type { Property, SearchFilters } from "../types"

export function filterProperties(properties: Property[], filters: SearchFilters): Property[] {
  return properties.filter((property) => {
    // Search query filter
    if (filters.query) {
      const query = filters.query.toLowerCase()
      const matchTitle = property.title.toLowerCase().includes(query)
      const matchDescription = property.description.toLowerCase().includes(query)
      const matchLocation =
        property.location.city.toLowerCase().includes(query) || property.location.address.toLowerCase().includes(query)
      if (!matchTitle && !matchDescription && !matchLocation) return false
    }

    // Type filter
    if (filters.type && property.type !== filters.type) return false

    // Status filter
    if (filters.status && property.status !== filters.status) return false

    // Province filter
    if (filters.province && property.location.province !== filters.province) return false

    // City filter
    if (filters.city && property.location.city !== filters.city) return false

    // Price filter
    if (filters.minPrice && property.price < filters.minPrice) return false
    if (filters.maxPrice && property.price > filters.maxPrice) return false

    // Bedrooms filter
    if (filters.minBedrooms && property.specifications.bedrooms < filters.minBedrooms) return false

    // Bathrooms filter
    if (filters.minBathrooms && property.specifications.bathrooms < filters.minBathrooms) return false

    // Land area filter
    if (filters.minLandArea && property.specifications.landArea < filters.minLandArea) return false

    // Building area filter
    if (filters.minBuildingArea && property.specifications.buildingArea < filters.minBuildingArea) return false

    return true
  })
}

export function getCities(properties: Property[]): string[] {
  const cities = new Set(properties.map((p) => p.location.city))
  return Array.from(cities).sort()
}
