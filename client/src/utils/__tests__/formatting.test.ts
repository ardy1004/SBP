import { formatPrice, formatDate, formatArea, truncateText } from '../formatting';

describe('Formatting Utils', () => {
  describe('formatPrice', () => {
    it('should format price in millions correctly', () => {
      expect(formatPrice(500000000)).toBe('Rp 500jt');
      expect(formatPrice(1500000000)).toBe('Rp 1.5M');
      expect(formatPrice(2500000000)).toBe('Rp 2.5M');
    });

    it('should format price in thousands correctly', () => {
      expect(formatPrice(5000000)).toBe('Rp 5jt');
      expect(formatPrice(15000000)).toBe('Rp 15jt');
    });

    it('should format regular prices correctly', () => {
      expect(formatPrice(500000)).toBe('Rp 500.000');
      expect(formatPrice(1500000)).toBe('Rp 1.500.000');
    });

    it('should handle per meter pricing', () => {
      expect(formatPrice(8000000, { isPerMeter: true })).toBe('Rp 8jt/m²');
      expect(formatPrice(15000000, { isPerMeter: true })).toBe('Rp 15jt/m²');
    });

    it('should handle string inputs', () => {
      expect(formatPrice('500000000')).toBe('Rp 500jt');
      expect(formatPrice('1500000')).toBe('Rp 1.500.000');
    });

    it('should handle invalid inputs', () => {
      expect(formatPrice('invalid')).toBe('Rp 0');
      expect(formatPrice(null as any)).toBe('Rp 0');
      expect(formatPrice(undefined as any)).toBe('Rp 0');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toBe('15 Januari 2024');
    });

    it('should handle different date formats', () => {
      const date = new Date('2024-12-25');
      expect(formatDate(date)).toBe('25 Desember 2024');
    });

    it('should handle invalid dates', () => {
      expect(formatDate(new Date('invalid'))).toBe('Invalid Date');
    });
  });

  describe('formatArea', () => {
    it('should format area correctly', () => {
      expect(formatArea(100)).toBe('100 m²');
      expect(formatArea(150.5)).toBe('150.5 m²');
      expect(formatArea(2000)).toBe('2.000 m²');
    });

    it('should handle string inputs', () => {
      expect(formatArea('100')).toBe('100 m²');
      expect(formatArea('150.5')).toBe('150.5 m²');
    });

    it('should handle invalid inputs', () => {
      expect(formatArea('invalid')).toBe('0 m²');
      expect(formatArea(null as any)).toBe('0 m²');
    });
  });

  describe('truncateText', () => {
    it('should not truncate short text', () => {
      expect(truncateText('Short text', { maxLength: 20 })).toBe('Short text');
    });

    it('should truncate long text', () => {
      expect(truncateText('This is a very long text that should be truncated', { maxLength: 20 })).toBe('This is a very long...');
    });

    it('should handle exact length', () => {
      expect(truncateText('Exact length text', { maxLength: 17 })).toBe('Exact length text');
    });

    it('should handle empty text', () => {
      expect(truncateText('', { maxLength: 10 })).toBe('');
    });

    it('should handle null/undefined', () => {
      expect(truncateText(null as any, { maxLength: 10 })).toBe('');
      expect(truncateText(undefined as any, { maxLength: 10 })).toBe('');
    });
  });
});