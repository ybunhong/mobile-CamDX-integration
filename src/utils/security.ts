/**
 * Security utilities for OWASP Mobile Top 10 compliance
 */

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove inline event handlers
    .trim();
}

/**
 * Validate Cambodian ID number format (9 digits)
 */
export function validateIdNumber(idNumber: string): boolean {
  if (!idNumber) return false;
  const sanitized = sanitizeInput(idNumber);
  return /^\d{9}$/.test(sanitized);
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function validateDateFormat(date: string): boolean {
  if (!date) return false;
  const sanitized = sanitizeInput(date);
  return /^\d{4}-\d{2}-\d{2}$/.test(sanitized);
}

/**
 * Validate gender input
 */
export function validateGender(gender: string): boolean {
  if (!gender) return false;
  const sanitized = sanitizeInput(gender).toUpperCase();
  return sanitized === 'M' || sanitized === 'F';
}

/**
 * Validate name fields (Khmer and English)
 * Prevent injection of special characters
 */
export function validateName(name: string): boolean {
  if (!name) return false;
  const sanitized = sanitizeInput(name);
  // Allow letters, spaces, and Khmer characters
  return /^[\p{L}\s]+$/u.test(sanitized);
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (!data) return '';
  if (data.length <= visibleChars) return data;
  return data.substring(0, visibleChars) + '*'.repeat(data.length - visibleChars);
}

/**
 * Validate URL to prevent SSRF attacks
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    // Only allow https protocol
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Sanitize user info object
 */
export function sanitizeUserInfo(userInfo: any): any {
  return {
    idNumber: sanitizeInput(userInfo.idNumber || ''),
    firstNameKh: sanitizeInput(userInfo.firstNameKh || ''),
    lastNameKh: sanitizeInput(userInfo.lastNameKh || ''),
    firstNameEn: sanitizeInput(userInfo.firstNameEn || ''),
    lastNameEn: sanitizeInput(userInfo.lastNameEn || ''),
    gender: validateGender(userInfo.gender) ? userInfo.gender : 'M',
    dob: sanitizeInput(userInfo.dob || ''),
    issuedDate: sanitizeInput(userInfo.issuedDate || ''),
    expiredDate: sanitizeInput(userInfo.expiredDate || ''),
  };
}
