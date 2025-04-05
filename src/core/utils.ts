/**
 * Utilities
 * 
 * Common utility functions used throughout the application
 */

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + ' bytes';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }
}

/**
 * Get file extension from file name
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
}

/**
 * Check if a file is of a supported type
 */
export function isSupportedFileType(file: File, supportedExtensions: string[]): boolean {
  const extension = '.' + getFileExtension(file.name);
  return supportedExtensions.includes(extension);
}

/**
 * Generate a filename for the redacted document
 */
export function generateRedactedFilename(originalFilename: string): string {
  const lastDotIndex = originalFilename.lastIndexOf('.');
  
  if (lastDotIndex === -1) {
    return `redacted_${originalFilename}`;
  }
  
  const nameWithoutExtension = originalFilename.substring(0, lastDotIndex);
  const extension = originalFilename.substring(lastDotIndex);
  
  return `redacted_${nameWithoutExtension}${extension}`;
}

/**
 * Debounce function to limit how often a function is called
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Sanitize a string for display (prevent XSS)
 */
export function sanitizeString(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Escape regular expression special characters
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
}

/**
 * Split text into words
 */
export function splitIntoWords(text: string): string[] {
  return text.split(/\\s+/).filter(Boolean);
}

/**
 * Convert array buffer to base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return window.btoa(binary);
}

/**
 * Highlight text in a string
 */
export function highlightText(text: string, query: string, caseSensitive = false): string {
  if (!query) return text;
  
  const escQuery = escapeRegExp(query);
  const regex = new RegExp(escQuery, caseSensitive ? 'g' : 'gi');
  
  return text.replace(regex, match => `<mark>${match}</mark>`);
}
