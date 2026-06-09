/**
 * Property Breadcrumb Component
 * Breadcrumb khusus untuk halaman properti dengan SEO optimization
 */
import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PropertyBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb untuk halaman properti
 * Mendukung SEO dengan struktur yang jelas
 */
export function PropertyBreadcrumb({ items, className = "" }: PropertyBreadcrumbProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`text-sm ${className}`}>
      <ol className="flex items-center flex-wrap gap-1">
        {/* Home */}
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Beranda</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center">
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 mx-1" />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-primary transition-colors truncate max-w-[150px]"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`${isLast ? "text-gray-900 font-medium" : "text-gray-500"} truncate max-w-[200px]`}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Generate breadcrumb items untuk halaman properti detail
 */
export function getPropertyBreadcrumbs(property: {
  property_type: string;
  purpose?: string;
  city?: string;
  district?: string;
  title: string;
}): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];

  // 1. Jenis properti (Rumah Dijual)
  const typeLabel = property.property_type;
  const purposeLabel = property.purpose || "Dijual";
  const typeSlug = typeLabel.toLowerCase();

  items.push({
    label: `${typeLabel} ${purposeLabel}`,
    href: `/${typeSlug}-dijual-yogyakarta`,
  });

  // 2. Kota (Yogyakarta)
  if (property.city) {
    const citySlug = property.city.toLowerCase().replace(/\s+/g, "-");
    items.push({
      label: property.city,
      href: `/${typeSlug}-dijual-${citySlug}`,
    });
  }

  // 3. Kecamatan (Sleman)
  if (property.district) {
    const districtSlug = property.district.toLowerCase().replace(/\s+/g, "-");
    items.push({
      label: property.district,
      href: `/${typeSlug}-dijual-${districtSlug}`,
    });
  }

  // 4. Current page (judul properti) - tanpa href
  items.push({
    label: property.title.length > 50 ? property.title.substring(0, 50) + "..." : property.title,
  });

  return items;
}

/**
 * Generate breadcrumb items untuk halaman kategori/lokasi
 */
export function getCategoryBreadcrumbs(propertyType: string, location?: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];
  const typeSlug = propertyType.toLowerCase();

  items.push({
    label: `${propertyType} Dijual`,
    href: `/${typeSlug}-dijual-yogyakarta`,
  });

  if (location) {
    const locationSlug = location.toLowerCase().replace(/\s+/g, "-");
    items.push({
      label: location,
    });
  }

  return items;
}
