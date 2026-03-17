import { useEffect } from 'react';
import type { Property } from '@shared/types';

interface PropertySchemaMarkupProps {
  property: Property;
}

export function PropertySchemaMarkup({ property }: PropertySchemaMarkupProps) {
  useEffect(() => {
    // Remove existing schema markup
    const existingSchema = document.querySelector('script[type="application/ld+json"]#property-schema');
    if (existingSchema) {
      existingSchema.remove();
    }

    // Create new schema markup
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.id = 'property-schema';

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      "name": property.judulProperti || `${property.jenisProperti} di ${property.kabupaten}`,
      "description": property.deskripsi || `Properti ${property.jenisProperti} ${property.status} di ${property.kabupaten}`,
      "url": window.location.href,
      "image": property.imageUrl,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": property.alamatLengkap || "",
        "addressLocality": property.kabupaten,
        "addressRegion": property.provinsi,
        "addressCountry": "ID"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "", // Would need actual coordinates
        "longitude": ""
      },
      "offers": {
        "@type": "Offer",
        "price": property.hargaProperti,
        "priceCurrency": "IDR",
        "availability": property.isSold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
        "validFrom": property.createdAt?.toISOString(),
        "seller": {
          "@type": "RealEstateAgent",
          "name": "Salam Bumi Property",
          "url": "https://salambumi.xyz"
        }
      },
      "numberOfRooms": property.kamarTidur || undefined,
      "numberOfBathroomsTotal": property.kamarMandi || undefined,
      "floorSize": property.luasBangunan ? {
        "@type": "QuantitativeValue",
        "value": property.luasBangunan,
        "unitText": "m²"
      } : undefined,
      "lotSize": property.luasTanah ? {
        "@type": "QuantitativeValue",
        "value": property.luasTanah,
        "unitText": "m²"
      } : undefined,
      "additionalProperty": [
        property.legalitas ? {
          "@type": "PropertyValue",
          "name": "Legalitas",
          "value": property.legalitas
        } : null,
        property.jenisProperti ? {
          "@type": "PropertyValue",
          "name": "Tipe Properti",
          "value": property.jenisProperti
        } : null
      ].filter(Boolean),
      "provider": {
        "@type": "RealEstateAgent",
        "name": "Salam Bumi Property",
        "url": "https://salambumi.xyz",
        "telephone": "+62-813-9127-8889",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Yogyakarta",
          "addressRegion": "DIY",
          "addressCountry": "ID"
        }
      }
    };

    schemaScript.textContent = JSON.stringify(schemaData, null, 2);
    document.head.appendChild(schemaScript);

    // Cleanup on unmount
    return () => {
      const script = document.querySelector('script[type="application/ld+json"]#property-schema');
      if (script) {
        script.remove();
      }
    };
  }, [property]);

  return null; // This component doesn't render anything
}

// Organization schema for the main website
export function OrganizationSchemaMarkup() {
  useEffect(() => {
    const existingSchema = document.querySelector('script[type="application/ld+json"]#organization-schema');
    if (existingSchema) return; // Already exists

    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.id = 'organization-schema';

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "Salam Bumi Property",
      "url": "https://salambumi.xyz",
      "logo": "https://salambumi.xyz/favicon.png",
      "description": "Discover premium properties in Indonesia with Salam Bumi Property. Search apartments, houses, villas, warehouses, and commercial properties for sale or rent.",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Yogyakarta",
        "addressRegion": "DIY",
        "addressCountry": "ID"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+62-813-9127-8889",
        "contactType": "customer service",
        "availableLanguage": ["Indonesian", "English"]
      },
      "sameAs": [
        // Add social media URLs when available
      ]
    };

    schemaScript.textContent = JSON.stringify(schemaData, null, 2);
    document.head.appendChild(schemaScript);
  }, []);

  return null;
}