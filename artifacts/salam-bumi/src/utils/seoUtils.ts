/**
 * SEO Utilities untuk Salam Bumi Property
 * Auto-generate meta title, description, dan schema markup (JSON-LD)
 */

// ============================================================================
// TYPES
// ============================================================================

export interface PropertySEOData {
  id?: string;
  title: string;
  slug: string;
  property_type: string;
  purpose?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  land_area?: number;
  building_area?: number;
  floors?: number;
  district?: string;
  city?: string;
  province?: string;
  village?: string;
  address?: string;
  description?: string;
  images?: string[];
  is_sold?: boolean;
  created_at?: number;
  updated_at?: number;
}

export interface SchemaListItem {
  name: string;
  url: string;
  image?: string;
  price?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const SITE_NAME = "Salam Bumi Property";
export const SITE_DOMAIN = "salambumi.xyz";
export const SITE_URL = `https://${SITE_DOMAIN}`;
export const SITE_LOGO = `${SITE_URL}/logo.png`;
export const SITE_WHATSAPP = "6281391278889";
export const SITE_EMAIL = "info@salambumi.xyz";

const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 155;

// Property type labels
export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  rumah: "Rumah",
  kost: "Kost",
  tanah: "Tanah",
  villa: "Villa",
  hotel: "Hotel",
  homestay: "Homestay",
  apartment: "Apartemen",
  ruko: "Ruko",
  gudang: "Gudang",
  "komersial lainnya": "Bangunan Komersial",
};

// Purpose labels
const PURPOSE_LABELS: Record<string, string> = {
  Dijual: "Dijual",
  Disewakan: "Disewakan",
  "Dijual & Disewakan": "Dijual & Disewakan",
};

// ============================================================================
// META TITLE GENERATOR
// ============================================================================

export function generateMetaTitle(property: PropertySEOData): string {
  const typeLabel =
    PROPERTY_TYPE_LABELS[property.property_type.toLowerCase()] ||
    property.property_type;
  const purposeLabel = PURPOSE_LABELS[property.purpose || "Dijual"] || "Dijual";

  const locationParts: string[] = [];
  if (property.district) locationParts.push(property.district);
  if (property.city) locationParts.push(property.city);
  const locationStr =
    locationParts.length > 0 ? locationParts.join(" ") : "Yogyakarta";

  let title = `${typeLabel} ${purposeLabel} ${locationStr} | ${SITE_NAME}`;

  if (title.length > MAX_TITLE_LENGTH) {
    title = `${typeLabel} ${purposeLabel} ${locationStr}`;
    if (title.length > MAX_TITLE_LENGTH) {
      const maxLocationLength =
        MAX_TITLE_LENGTH - `${typeLabel} ${purposeLabel} `.length - 3;
      title = `${typeLabel} ${purposeLabel} ${locationStr.substring(0, maxLocationLength)}`;
    }
  }

  return title;
}

export function generateCategoryMetaTitle(
  propertyType: string,
  location: string,
): string {
  const typeLabel =
    PROPERTY_TYPE_LABELS[propertyType.toLowerCase()] || propertyType;
  let title = `${typeLabel} Dijual di ${location} | ${SITE_NAME}`;
  if (title.length > MAX_TITLE_LENGTH) {
    title = `${typeLabel} Dijual di ${location}`;
    if (title.length > MAX_TITLE_LENGTH) {
      const maxLocLength = MAX_TITLE_LENGTH - `${typeLabel} Dijual di `.length;
      title = `${typeLabel} Dijual di ${location.substring(0, maxLocLength)}`;
    }
  }
  return title;
}

// ============================================================================
// META DESCRIPTION GENERATOR
// ============================================================================

export function generateMetaDescription(property: PropertySEOData): string {
  const typeLabel =
    PROPERTY_TYPE_LABELS[property.property_type.toLowerCase()] ||
    property.property_type;
  const purposeLabel = (
    PURPOSE_LABELS[property.purpose || "Dijual"] || "Dijual"
  ).toLowerCase();

  const locationParts: string[] = [];
  if (property.district) locationParts.push(property.district);
  if (property.city) locationParts.push(property.city);
  const locationStr = locationParts.join(" ") || "Yogyakarta";

  const features: string[] = [];
  if (property.bedrooms) features.push(`${property.bedrooms} KT`);
  if (property.bathrooms) features.push(`${property.bathrooms} KM`);
  if (property.land_area) features.push(`${property.land_area}m²`);
  const featureStr = features.length > 0 ? features.join(", ") + ". " : "";

  let priceStr = "";
  if (property.price && property.price > 0) {
    const priceFormatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(property.price);
    priceStr = `Harga ${priceFormatted}. `;
  }

  let description = `${typeLabel} ${purposeLabel} di ${locationStr}. ${featureStr}${priceStr}Lihat detail, foto, dan hubungi kami sekarang.`;

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    description = description.substring(0, MAX_DESCRIPTION_LENGTH - 3) + "...";
  }
  return description;
}

export function generateCategoryMetaDescription(
  propertyType: string,
  location: string,
  listingCount: number = 0,
): string {
  const typeLabel =
    PROPERTY_TYPE_LABELS[propertyType.toLowerCase()] || propertyType;
  let description =
    listingCount > 0
      ? `Temukan ${listingCount} ${typeLabel.toLowerCase()} dijual di ${location}. Lokasi strategis, harga terbaik. Lihat daftar properti terbaru di Salam Bumi Property.`
      : `Temukan ${typeLabel.toLowerCase()} dijual di ${location}. Lokasi strategis, harga terbaik. Lihat daftar properti terbaru di Salam Bumi Property.`;
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    description = description.substring(0, MAX_DESCRIPTION_LENGTH - 3) + "...";
  }
  return description;
}

// ============================================================================
// CANONICAL URL
// ============================================================================

export function generateCanonicalUrl(property: PropertySEOData): string {
  const purpose = (property.purpose || "Dijual")
    .toLowerCase()
    .replace(/\s+/g, "-");
  const type = property.property_type.toLowerCase();
  const city =
    property.city?.toLowerCase().replace(/\s+/g, "-") || "yogyakarta";
  const district = property.district?.toLowerCase().replace(/\s+/g, "-");
  const slug = property.slug;

  if (district) {
    return `${SITE_URL}/${purpose}/${type}/${city}/${district}/${slug}`;
  }
  return `${SITE_URL}/${purpose}/${type}/${city}/${slug}`;
}

export function generateCategoryCanonicalUrl(
  propertyType: string,
  location: string,
): string {
  const type = propertyType.toLowerCase();
  const loc = location.toLowerCase().replace(/\s+/g, "-");
  return `${SITE_URL}/${type}-dijual-${loc}`;
}

// ============================================================================
// SCHEMA: RealEstateListing (Enhanced)
// ============================================================================

export function generatePropertySchema(property: PropertySEOData): object {
  const canonicalUrl = generateCanonicalUrl(property);

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": canonicalUrl,
    name: property.title,
    url: canonicalUrl,
    description:
      property.description?.substring(0, 500) ||
      generateMetaDescription(property),
    datePosted: property.created_at
      ? new Date(property.created_at * 1000).toISOString()
      : new Date().toISOString(),
    ...(property.updated_at && {
      dateModified: new Date(property.updated_at * 1000).toISOString(),
    }),
  };

  // Images
  if (property.images && property.images.length > 0) {
    schema.image = property.images.slice(0, 5);
  }

  // Address
  const addressParts: string[] = [];
  if (property.village) addressParts.push(property.village);
  if (property.district) addressParts.push(property.district);
  if (property.city) addressParts.push(property.city);

  if (addressParts.length > 0) {
    schema.address = {
      "@type": "PostalAddress",
      addressLocality: property.district || property.city || "Yogyakarta",
      addressRegion: property.city || "DI Yogyakarta",
      addressCountry: "ID",
    };
    if (property.address) {
      schema.address.streetAddress = property.address;
    }
  }

  // Price (Offer)
  if (property.price && property.price > 0) {
    schema.offers = {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "IDR",
      availability: property.is_sold
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      url: canonicalUrl,
    };
  }

  // Floor size
  if (property.building_area) {
    schema.floorSize = {
      "@type": "QuantitativeValue",
      value: property.building_area,
      unitCode: "MTK",
    };
  }

  // Lot size
  if (property.land_area) {
    schema.lotSize = {
      "@type": "QuantitativeValue",
      value: property.land_area,
      unitCode: "MTK",
    };
  }

  // Number of rooms
  if (property.bedrooms) {
    schema.numberOfRooms = {
      "@type": "QuantitativeValue",
      value: property.bedrooms,
    };
  }

  // Number of bathrooms
  if (property.bathrooms) {
    schema.numberOfBathroomsTotal = property.bathrooms;
  }

  // Number of floors
  if (property.floors) {
    schema.numberOfFloorsTotal = property.floors;
  }

  return schema;
}

// ============================================================================
// SCHEMA: BreadcrumbList
// ============================================================================

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[],
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ============================================================================
// SCHEMA: Organization
// ============================================================================

export function generateOrganizationSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: SITE_LOGO,
      width: 512,
      height: 512,
    },
    image: SITE_LOGO,
    email: SITE_EMAIL,
    telephone: `+${SITE_WHATSAPP}`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: `+${SITE_WHATSAPP}`,
      contactType: "customer service",
      availableLanguage: ["Indonesian"],
    },
    sameAs: [
      `https://wa.me/${SITE_WHATSAPP}`,
      "https://www.instagram.com/salam.bumi/",
    ],
  };
}

// ============================================================================
// SCHEMA: WebSite dengan SearchAction
// ============================================================================

export function generateWebSiteSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/properties?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ============================================================================
// SCHEMA: ItemList (untuk category/property listing pages)
// ============================================================================

export function generateItemListSchema(
  name: string,
  items: SchemaListItem[],
): object {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: item.url,
      name: item.name,
      ...(item.image && {
        item: {
          "@type": "Product",
          name: item.name,
          url: item.url,
          image: item.image,
          ...(item.price && {
            offers: {
              "@type": "Offer",
              price: item.price,
              priceCurrency: "IDR",
            },
          }),
        },
      }),
    })),
  };
}

// ============================================================================
// SCHEMA: RealEstateAgent / LocalBusiness
// ============================================================================

export function generateLocalBusinessSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_LOGO,
    image: SITE_LOGO,
    email: SITE_EMAIL,
    telephone: `+${SITE_WHATSAPP}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Yogyakarta",
      addressRegion: "DI Yogyakarta",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -7.7956,
      longitude: 110.3695,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "08:00",
      closes: "17:00",
    },
    priceRange: "$$",
  };
}

// ============================================================================
// SCHEMA: FAQPage
// ============================================================================

export function generateFAQSchema(
  faqs: { question: string; answer: string }[],
): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// ============================================================================
// HELPER: Inject schema ke document
// ============================================================================

export function injectSchema(id: string, schema: object): void {
  if (typeof document === "undefined") return;

  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.setAttribute("type", "application/ld+json");
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema);
}

// ============================================================================
// HELPER: Format harga
// ============================================================================

export function formatPriceForSEO(price: number): string {
  if (price >= 1000000000) {
    return `${(price / 1000000000).toFixed(1)} Miliar`;
  }
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(0)} Juta`;
  }
  return new Intl.NumberFormat("id-ID").format(price);
}
