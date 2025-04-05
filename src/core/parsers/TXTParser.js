/**
 * Text File Parser
 * 
 * Handles parsing of plain text files
 */

import { generateId } from '../utils.js';

export class TXTParser {
  constructor() {
    this.fileType = 'txt';
  }
  
  /**
   * Check if this parser supports the given file
   */
  supports(file) {
    return file.type === 'text/plain' || 
           file.name.toLowerCase().endsWith('.txt');
  }
  
  /**
   * Parse a text file and extract its content
   */
  async parse(file) {
    try {
      const text = await file.text();
      
      // Split into paragraphs (by double newline)
      const paragraphs = text.split(/\n\s*\n/);
      
      // Initialize metadata
      const metadata = {
        wordCount: text.split(/\s+/).filter(Boolean).length,
        characterCount: text.length,
      };
      
      // Process sections
      const sections = [];
      let fullText = '';
      
      // Process each paragraph
      for (const paragraph of paragraphs) {
        if (paragraph.trim()) {
          const startPos = fullText.length;
          const sectionText = paragraph.trim();
          
          sections.push({
            id: generateId(),
            type: 'paragraph',
            content: sectionText,
            position: {
              start: startPos,
              end: startPos + sectionText.length,
            },
          });
          
          fullText += sectionText + '\n';
        }
      }
      
      return {
        content: text,
        metadata,
        sections,
        filename: file.name,
        fileType: this.fileType,
        fileSize: file.size,
      };
    } catch (error) {
      console.error("Error parsing TXT:", error);
      throw new Error(`Failed to parse text file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export an instance of the parser
export const txtParser = new TXTParser();
export default txtParser;
