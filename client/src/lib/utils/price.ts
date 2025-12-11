/**
 * Price formatting utilities for consistent display across the application
 */

export interface PriceFormatOptions {
  isPerMeter?: boolean;
  locale?: string;
  currency?: string;
}

export function formatPrice(
  price: string | number,
  options: PriceFormatOptions = {}
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
 * Legacy function for backward compatibility
 * @deprecated Use formatPrice instead
 */
export function formatPriceLegacy(
  price: string,
  isPerMeter: boolean = false
): string {
  return formatPrice(price, { isPerMeter });
}