/**
 * CSV Parser
 * 
 * Handles parsing of CSV files
 */

import { generateId } from '../utils.js';

export class CSVParser {
  constructor() {
    this.fileType = 'csv';
  }
  
  /**
   * Check if this parser supports the given file
   */
  supports(file) {
    return file.type === 'text/csv' || 
           file.name.toLowerCase().endsWith('.csv');
  }
  
  /**
   * Parse a CSV file and extract its content
   */
  async parse(file) {
    try {
      const text = await file.text();
      
      // Simple CSV parsing (more robust parsing would use a library like PapaParse)
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      
      // Extract header (first line)
      const header = this.parseCSVLine(lines[0]);
      
      // Process the rows
      const rows = lines.slice(1).map(line => this.parseCSVLine(line));
      
      // Initialize metadata
      const metadata = {
        wordCount: 0,
        characterCount: text.length,
      };
      
      // Process sections (each row as a section)
      const sections = [];
      let fullText = '';
      
      // Add header as first section
      const headerText = header.join(', ');
      sections.push({
        id: generateId(),
        type: 'paragraph',
        content: headerText,
        position: {
          start: 0,
          end: headerText.length,
        },
      });
      
      fullText += headerText + '\n';
      metadata.wordCount += headerText.split(/\s+/).filter(Boolean).length;
      
      // Add each row as a section
      for (const row of rows) {
        const rowText = row.join(', ');
        if (rowText.trim()) {
          const startPos = fullText.length;
          
          sections.push({
            id: generateId(),
            type: 'paragraph',
            content: rowText,
            position: {
              start: startPos,
              end: startPos + rowText.length,
            },
          });
          
          fullText += rowText + '\n';
          metadata.wordCount += rowText.split(/\s+/).filter(Boolean).length;
        }
      }
      
      return {
        content: fullText,
        metadata,
        sections,
        filename: file.name,
        fileType: this.fileType,
        fileSize: file.size,
      };
    } catch (error) {
      console.error("Error parsing CSV:", error);
      throw new Error(`Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Parse a CSV line into an array of values
   * This is a simplified CSV parser that doesn't handle all edge cases
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        // If we see a double quote
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Escaped quote inside quotes
          current += '"';
          i++; // Skip the next quote
        } else {
          // Start or end of quoted string
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current);
        current = '';
      } else {
        // Regular character
        current += char;
      }
    }
    
    // Add the last field
    result.push(current);
    
    return result;
  }
}

// Export an instance of the parser
export const csvParser = new CSVParser();
export default csvParser;
