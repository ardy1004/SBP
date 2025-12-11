// Re-export utilities from organized modules
export { cn } from './utils/ui';
export { generatePropertySlug, parsePropertySlug } from './utils/slug';
export { generatePropertyDescription } from './utils/ai';
export { generateChatResponse } from './utils/chat';
export { formatPrice, formatPriceLegacy } from './utils/price';

// Re-export formatting utilities
export {
  formatPrice as formatPriceNew,
  formatDate,
  formatArea,
  truncateText,
  formatNumber,
  formatFileSize,
  capitalize,
  slugToTitle,
} from '../utils/formatting';

// Re-export validation utilities
export {
  validateEmail,
  validatePhone,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateNumeric,
  validatePositiveNumber,
  validatePrice,
  validateArea,
  validatePropertyTitle,
  validatePropertyDescription,
  validateUrl,
  validateFileSize,
  validateFileType,
  validateForm,
  type ValidationResult,
} from '../utils/validation';
