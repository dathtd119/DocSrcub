/**
 * Parser Registry
 * 
 * This module manages the registration and retrieval of document parsers.
 * It implements a registry pattern to allow dynamic loading of document format handlers.
 */

import { SUPPORTED_FILE_TYPES } from '../constants.js';

class ParserRegistry {
  constructor() {
    this.parsers = new Map();
  }
  
  /**
   * Register a parser for a specific file type
   */
  register(parser) {
    this.parsers.set(parser.fileType, parser);
    console.log(`Registered parser for file type: ${parser.fileType}`);
  }
  
  /**
   * Get a parser for a specific file
   */
  getParserForFile(file) {
    // Try to find a parser that supports this file
    for (const parser of this.parsers.values()) {
      if (parser.supports(file)) {
        return parser;
      }
    }
    
    return null;
  }
  
  /**
   * Get a parser for a specific file type
   */
  getParserForType(fileType) {
    return this.parsers.get(fileType) || null;
  }
  
  /**
   * Check if there's a parser for a specific file
   */
  hasParserForFile(file) {
    return this.getParserForFile(file) !== null;
  }
  
  /**
   * Get all supported file extensions
   */
  getSupportedExtensions() {
    const extensions = [];
    
    this.parsers.forEach((_, fileType) => {
      switch (fileType) {
        case 'pdf':
          extensions.push('.pdf');
          break;
        case 'docx':
          extensions.push('.docx', '.doc');
          break;
        case 'txt':
          extensions.push('.txt');
          break;
        case 'csv':
          extensions.push('.csv');
          break;
        case 'xlsx':
          extensions.push('.xlsx', '.xls');
          break;
        case 'pptx':
          extensions.push('.pptx', '.ppt');
          break;
        case 'html':
          extensions.push('.html', '.htm');
          break;
        case 'md':
          extensions.push('.md', '.markdown');
          break;
        case 'office':
          // The office parser handles multiple formats
          extensions.push(
            '.docx', '.pptx', '.xlsx',
            '.odt', '.odp', '.ods', '.pdf'
          );
          break;
      }
    });
    
    // Remove duplicates
    return [...new Set(extensions)];
  }
  
  /**
   * Get list of supported file types for UI display
   */
  getSupportedFileTypes() {
    return this.getSupportedExtensions().join(', ');
  }
}

// Create and export a singleton instance
export const parserRegistry = new ParserRegistry();
export default parserRegistry;
