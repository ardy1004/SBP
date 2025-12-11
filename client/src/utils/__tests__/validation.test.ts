import {
  validateEmail,
  validatePhone,
  validateRequired,
  validatePrice,
  validateArea,
  validateMinLength,
  validateMaxLength,
  validateNumeric,
  validateUrl
} from '../validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com').isValid).toBe(true);
      expect(validateEmail('user.name+tag@example.co.id').isValid).toBe(true);
      expect(validateEmail('test123@gmail.com').isValid).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid').isValid).toBe(false);
      expect(validateEmail('test@').isValid).toBe(false);
      expect(validateEmail('@example.com').isValid).toBe(false);
      expect(validateEmail('test.example.com').isValid).toBe(false);
      expect(validateEmail('').isValid).toBe(false);
      expect(validateEmail(null as any).isValid).toBe(false);
      expect(validateEmail(undefined as any).isValid).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      expect(validatePhone('08123456789').isValid).toBe(true);
      expect(validatePhone('+628123456789').isValid).toBe(true);
      expect(validatePhone('0211234567').isValid).toBe(true);
      expect(validatePhone('0812-3456-789').isValid).toBe(true);
      expect(validatePhone('0812 3456 789').isValid).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123').isValid).toBe(false);
      expect(validatePhone('abcdefghij').isValid).toBe(false);
      expect(validatePhone('08123456789012345').isValid).toBe(false);
      expect(validatePhone('').isValid).toBe(false);
      expect(validatePhone(null as any).isValid).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('should validate required fields', () => {
      expect(validateRequired('test').isValid).toBe(true);
      expect(validateRequired('  test  ').isValid).toBe(true);
      expect(validateRequired(123).isValid).toBe(true);
      expect(validateRequired([1, 2, 3]).isValid).toBe(true);
    });

    it('should reject empty required fields', () => {
      expect(validateRequired('').isValid).toBe(false);
      expect(validateRequired('   ').isValid).toBe(false);
      expect(validateRequired(null).isValid).toBe(false);
      expect(validateRequired(undefined).isValid).toBe(false);
      expect(validateRequired([]).isValid).toBe(false);
    });
  });

  describe('validatePrice', () => {
    it('should validate correct prices', () => {
      expect(validatePrice('1000000').isValid).toBe(true);
      expect(validatePrice('5000000').isValid).toBe(true);
      expect(validatePrice('1000000000').isValid).toBe(true);
    });

    it('should reject invalid prices', () => {
      expect(validatePrice('0').isValid).toBe(false);
      expect(validatePrice('-1000').isValid).toBe(false);
      expect(validatePrice('invalid').isValid).toBe(false);
      expect(validatePrice('').isValid).toBe(false);
    });
  });

  describe('validateArea', () => {
    it('should validate correct areas', () => {
      expect(validateArea('50').isValid).toBe(true);
      expect(validateArea('100').isValid).toBe(true);
      expect(validateArea('10000').isValid).toBe(true);
    });

    it('should reject invalid areas', () => {
      expect(validateArea('0').isValid).toBe(false);
      expect(validateArea('-50').isValid).toBe(false);
      expect(validateArea('invalid').isValid).toBe(false);
      expect(validateArea('').isValid).toBe(false);
    });
  });

  describe('validateMinLength', () => {
    it('should validate minimum length', () => {
      expect(validateMinLength('hello', 3).isValid).toBe(true);
      expect(validateMinLength('hi', 2).isValid).toBe(true);
    });

    it('should reject strings below minimum length', () => {
      expect(validateMinLength('hi', 3).isValid).toBe(false);
      expect(validateMinLength('', 1).isValid).toBe(false);
    });
  });

  describe('validateMaxLength', () => {
    it('should validate maximum length', () => {
      expect(validateMaxLength('hi', 3).isValid).toBe(true);
      expect(validateMaxLength('hello', 5).isValid).toBe(true);
    });

    it('should reject strings above maximum length', () => {
      expect(validateMaxLength('hello', 3).isValid).toBe(false);
    });
  });

  describe('validateNumeric', () => {
    it('should validate numeric values', () => {
      expect(validateNumeric('123').isValid).toBe(true);
      expect(validateNumeric('456').isValid).toBe(true);
      expect(validateNumeric('123.45').isValid).toBe(true);
    });

    it('should reject non-numeric values', () => {
      expect(validateNumeric('abc').isValid).toBe(false);
      expect(validateNumeric('12a34').isValid).toBe(false);
      expect(validateNumeric('').isValid).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      expect(validateUrl('https://example.com').isValid).toBe(true);
      expect(validateUrl('http://example.com').isValid).toBe(true);
      expect(validateUrl('https://www.example.com/path').isValid).toBe(true);
      expect(validateUrl('https://example.com:8080').isValid).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateUrl('not-a-url').isValid).toBe(false);
      expect(validateUrl('ftp://example.com').isValid).toBe(false);
    });

    it('should allow empty URLs (optional)', () => {
      expect(validateUrl('').isValid).toBe(true);
    });
  });
});