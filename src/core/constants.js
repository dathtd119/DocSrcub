/**
 * Runtime constants for DocScrub
 * This file contains runtime-accessible values that are used by both TypeScript and JavaScript
 */

// Supported file types as a simple array for runtime use
export const SUPPORTED_FILE_TYPES = [
  'pdf', 
  'docx', 
  'txt', 
  'csv', 
  'xlsx', 
  'pptx',
  'odt',
  'odp',
  'ods',
  'html', 
  'md'
];

// Document section types
export const SECTION_TYPES = [
  'paragraph',
  'heading',
  'list',
  'table',
  'image',
  'other'
];

// Sensitive information categories
export const SENSITIVE_CATEGORIES = [
  'name',
  'email',
  'phone',
  'address',
  'ssn',
  'creditcard',
  'date',
  'organization',
  'financial',
  'medical',
  'other'
];

// Redaction methods
export const REDACTION_METHODS = [
  'replace',
  'asterisks',
  'blackout'
];

// Default redaction options
export const DEFAULT_REDACTION_OPTIONS = {
  method: 'replace',
  replacementText: '[REDACTED]',
  preserveLength: false,
  caseSensitive: false,
  wholeWord: true
};
