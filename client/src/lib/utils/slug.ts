// Generate SEO-friendly slug for property URLs (optimized version)
export function generatePropertySlug(property: {
  status?: string;
  jenis_properti?: string;
  provinsi?: string;
  kabupaten?: string;
  judul_properti?: string;
  kode_listing?: string;
}): string {
  // Clean province name (remove "DI." prefix and standardize)
  const cleanProvince = (provinsi: string) => {
    return provinsi
      .replace(/^DI\./i, '') // Remove "DI." prefix
      .replace(/^DAERAH\s+ISTIMEWA\s+/i, '') // Remove "Daerah Istimewa" prefix
      .toLowerCase()
      .trim();
  };

  // Extract key words from title (first 3-4 meaningful words)
  const extractKeyWords = (title: string): string => {
    if (!title) return '';

    // Split by spaces and filter out common words
    const words = title.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2) // Remove very short words
      .filter(word => !['dan', 'atau', 'dengan', 'yang', 'di', 'ke', 'dari', 'untuk', 'oleh', 'pada', 'dalam'].includes(word)) // Remove common words
      .slice(0, 3); // Take only first 3 words

    return words.join('-');
  };

  const parts = [
    property.status || 'dijual', // Status (dijual/disewakan)
    property.jenis_properti || 'properti', // Property type (kost, rumah, etc)
    cleanProvince(property.provinsi || ''), // Province (yogyakarta, jakarta, etc)
    property.kabupaten?.toLowerCase() || '', // Regency/City
    extractKeyWords(property.judul_properti || ''), // Key words from title (max 3 words)
    property.kode_listing || '' // Property code (K2.60, R1.25, etc)
  ];

  // Clean and format each part
  const cleanedParts = parts.map((part, index) => {
    if (!part) return '';

    // For kode_listing, keep original format
    if (index === 5) {
      return part.trim();
    }

    // For other parts, make lowercase and clean
    return part
      .toLowerCase()
      .trim()
      // Replace spaces and special characters with hyphens
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }).filter(part => part.length > 0); // Remove empty parts

  return cleanedParts.join('-');
}

// Parse slug back to property search criteria (for routing)
export function parsePropertySlug(slug: string): {
  status?: string;
  jenis_properti?: string;
  provinsi?: string;
  kabupaten?: string;
  judul_properti?: string;
  kode_listing?: string;
} {
  const parts = slug.split('-');

  // Try to identify kode_listing (more flexible patterns: K2.60, R1.25, A123, etc)
  let kodeListingIndex = -1;
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i].toUpperCase();
    // More flexible regex to match various kode_listing patterns
    if (/^[A-Z]+\d+[\.\d]*$/.test(part) || /^\d+[A-Z]+\d*$/.test(part)) {
      kodeListingIndex = i;
      break;
    }
  }

  if (kodeListingIndex === -1) {
    // Fallback: assume last part is kode_listing
    kodeListingIndex = parts.length - 1;
  }

  const kode_listing = parts[kodeListingIndex]?.toUpperCase();

  // Extract other parts based on position
  const status = parts[0];
  const jenis_properti = parts[1];

  // Reconstruct location parts (provinsi-kabupaten might be combined)
  let provinsi = '';
  let kabupaten = '';
  let judulStartIndex = 2;

  if (parts.length > kodeListingIndex) {
    // Try to identify location parts
    const locationParts = parts.slice(2, kodeListingIndex);

    // Common province names in Indonesia (more comprehensive)
    const provinces = ['diyogyakarta', 'jakarta', 'jabar', 'jateng', 'jatim', 'bali', 'sumatera', 'sulawesi', 'kalimantan', 'papua', 'banten', 'lampung', 'riau', 'jambi'];

    for (let i = 0; i < locationParts.length; i++) {
      if (provinces.some(p => locationParts[i].includes(p))) {
        provinsi = locationParts[i];
        kabupaten = locationParts[i + 1] || '';
        judulStartIndex = 2 + i + (kabupaten ? 1 : 0) + 1;
        break;
      }
    }

    // If no province found, assume first two are location
    if (!provinsi && locationParts.length >= 2) {
      provinsi = locationParts[0];
      kabupaten = locationParts[1];
      judulStartIndex = 4;
    } else if (!provinsi && locationParts.length === 1) {
      provinsi = locationParts[0];
      judulStartIndex = 3;
    }
  }

  // Reconstruct title from remaining parts
  const titleParts = parts.slice(judulStartIndex, kodeListingIndex);
  const judul_properti = titleParts.join(' ').replace(/-/g, ' ');

  return {
    status,
    jenis_properti,
    provinsi,
    kabupaten,
    judul_properti,
    kode_listing
  };
}