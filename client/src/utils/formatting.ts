/**
 * Centralized formatting utilities for consistent display across the application
 */

/**
 * Format price with proper currency and scaling
 */
export function formatPrice(
  price: string | number,
  options: {
    isPerMeter?: boolean;
    locale?: string;
    currency?: string;
  } = {}
): string {
  const { isPerMeter = false, locale = 'id-ID', currency = 'IDR' } = options;

  const num = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(num)) {
    return 'Harga tidak tersedia';
  }

  if (isPerMeter) {
    return formatPricePerMeter(num, locale);
  }

  return formatPriceRegular(num, locale);
}

function formatPricePerMeter(price: number, locale: string): string {
  if (price >= 1000000000) {
    const value = price / 1000000000;
    const rounded = Math.round(value * 10) / 10;
    return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}jt/m²`;
  } else if (price >= 1000000) {
    const value = price / 1000000;
    const rounded = Math.round(value * 10) / 10;
    return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}jt/m²`;
  } else if (price >= 1000) {
    const value = price / 1000;
    const rounded = Math.round(value * 10) / 10;
    return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}rb/m²`;
  }
  return `Rp ${price.toLocaleString(locale)}/m²`;
}

function formatPriceRegular(price: number, locale: string): string {
  if (price >= 1000000000) {
    const value = price / 1000000000;
    const rounded = Math.round(value * 10) / 10;
    return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}M`;
  } else if (price >= 1000000) {
    const value = price / 1000000;
    const rounded = Math.round(value * 10) / 10;
    return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}M`;
  }
  return `Rp ${price.toLocaleString(locale)}`;
}

/**
 * Format date with various options
 */
export function formatDate(
  date: Date | string,
  options: {
    format?: 'short' | 'medium' | 'long' | 'relative';
    locale?: string;
  } = {}
): string {
  const { format = 'medium', locale = 'id-ID' } = options;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Tanggal tidak valid';
  }

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

    case 'long':
      return dateObj.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

    case 'relative':
      return formatRelativeDate(dateObj);

    case 'medium':
    default:
      return dateObj.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
  }
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Hari ini';
  } else if (diffInDays === 1) {
    return 'Kemarin';
  } else if (diffInDays < 7) {
    return `${diffInDays} hari yang lalu`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} minggu yang lalu`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} bulan yang lalu`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} tahun yang lalu`;
  }
}

/**
 * Format area with proper units
 */
export function formatArea(area: number | string): string {
  const num = typeof area === 'string' ? parseFloat(area) : area;

  if (isNaN(num)) {
    return 'Luas tidak tersedia';
  }

  return `${num.toLocaleString('id-ID')} m²`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(
  text: string,
  options: {
    maxLength?: number;
    suffix?: string;
  } = {}
): string {
  const { maxLength = 100, suffix = '...' } = options;

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Format number with proper locale
 */
export function formatNumber(
  num: number | string,
  options: {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const {
    locale = 'id-ID',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2
  } = options;

  const number = typeof num === 'string' ? parseFloat(num) : num;

  if (isNaN(number)) {
    return '0';
  }

  return number.toLocaleString(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  });
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Capitalize first letter of each word
 */
export function capitalize(text: string): string {
  return text.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Convert slug to title case
 */
export function slugToTitle(slug: string): string {
  return capitalize(slug.replace(/-/g, ' '));
}