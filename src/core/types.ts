/**
 * Core types for the DocScrub application
 */

// Document data structure after parsing
export interface ParsedDocument {
  content: string;
  metadata: DocumentMetadata;
  sections: DocumentSection[];
  filename: string;
  fileType: SupportedFileType;
  fileSize: number;
}

// Document section (paragraph, heading, etc.)
export interface DocumentSection {
  id: string;
  type: 'paragraph' | 'heading' | 'list' | 'table' | 'image' | 'other';
  content: string;
  position: {
    start: number;
    end: number;
  };
}

// Basic document metadata
export interface DocumentMetadata {
  title?: string;
  author?: string;
  createdAt?: string;
  modifiedAt?: string;
  pageCount?: number;
  wordCount?: number;
  characterCount?: number;
}

// Supported file types for parsing
export type SupportedFileType = 'pdf' | 'docx' | 'txt' | 'csv' | 'xlsx' | 'pptx' | 'html' | 'md';

// Detected sensitive information item
export interface SensitiveItem {
  id: string;
  text: string;
  category: SensitiveCategory;
  positions: {
    sectionId: string;
    start: number;
    end: number;
  }[];
  confidence: number; // 0-1 score of confidence in detection
  selected: boolean; // Whether this item is selected for redaction
}

// Categories of sensitive information
export type SensitiveCategory = 
  | 'name' 
  | 'email' 
  | 'phone' 
  | 'address' 
  | 'ssn' 
  | 'creditcard' 
  | 'date' 
  | 'organization'
  | 'financial'
  | 'medical'
  | 'other';

// Redaction options
export interface RedactionOptions {
  method: 'replace' | 'asterisks' | 'blackout';
  replacementText?: string; // Used when method is 'replace'
  preserveLength: boolean; // Whether to preserve the original text length
  caseSensitive: boolean;
  wholeWord: boolean;
}

// Document parser interface
export interface DocumentParser {
  fileType: SupportedFileType;
  parse(file: File): Promise<ParsedDocument>;
  supports(file: File): boolean;
}

// Application state
export interface AppState {
  currentFile?: File;
  parsedDocument?: ParsedDocument;
  sensitiveItems: SensitiveItem[];
  redactionOptions: RedactionOptions;
  status: 'idle' | 'uploading' | 'parsing' | 'analyzing' | 'redacting' | 'downloading' | 'error';
  error?: string;
  progress: number; // 0-100
}
