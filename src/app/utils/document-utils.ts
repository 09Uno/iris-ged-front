/**
 * Document-related utility functions
 */

export class DocumentUtils {
  
  /**
   * Generates a unique protocol number
   * Format: YYYY.MM.DD.XXXX (where XXXX is a random number)
   */
  static generateProtocol(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `${year}.${month}.${day}.${random}`;
  }

  /**
   * Generates a random alphanumeric string
   * @param length - Length of the generated string
   * @param includeNumbers - Include numbers in the string
   * @param includeSpecialChars - Include special characters
   */
  static generateRandom(
    length: number = 8, 
    includeNumbers: boolean = true, 
    includeSpecialChars: boolean = false
  ): string {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    
    if (includeNumbers) {
      chars += '0123456789';
    }
    
    if (includeSpecialChars) {
      chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    }
    
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  /**
   * Generates a unique document identifier
   * Format: DOC-YYYYMMDD-XXXXXX
   */
  static generateDocumentId(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random = this.generateRandom(6, true, false).toUpperCase();
    
    return `DOC-${dateStr}-${random}`;
  }

  /**
   * Validates protocol format
   * @param protocol - Protocol string to validate
   */
  static isValidProtocol(protocol: string): boolean {
    const protocolRegex = /^\d{4}\.\d{2}\.\d{2}\.\d{4}$/;
    return protocolRegex.test(protocol);
  }

  /**
   * Sanitizes filename for storage
   * @param filename - Original filename
   */
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }
}