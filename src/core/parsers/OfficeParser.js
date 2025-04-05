/**
 * Office Parser
 * 
 * A unified parser for various office document formats using officeparser
 * Supports: docx, pptx, xlsx, odt, odp, ods, pdf
 */

import * as officeparser from 'officeparser';
import { generateId } from '../utils.js';

export class OfficeParser {
  constructor() {
    this.fileType = 'office';
    this.supportedExtensions = ['docx', 'pptx', 'xlsx', 'odt', 'odp', 'ods', 'pdf'];
    console.log("Office Parser initialized using officeparser library");
  }
  
  /**
   * Check if this parser supports the given file
   */
  supports(file) {
    const fileName = file.name.toLowerCase();
    return this.supportedExtensions.some(ext => fileName.endsWith(`.${ext}`));
  }
  
  /**
   * Get specific file type from filename
   */
  getFileType(fileName) {
    const extension = fileName.toLowerCase().split('.').pop();
    return this.supportedExtensions.includes(extension) ? extension : 'unknown';
  }
  
  /**
   * Parse an office document and extract its content
   */
  async parse(file) {
    try {
      console.log(`Starting Office document parsing for file: ${file.name}`);
      
      const arrayBuffer = await file.arrayBuffer();
      const result = await officeparser.parseOffice(arrayBuffer, { outputFormat: 'html' });
      
      // Process the extracted content
      const textContent = this.extractTextFromHtml(result.content);
      
      // Build metadata
      const metadata = {
        wordCount: textContent.split(/\s+/).filter(Boolean).length,
        characterCount: textContent.length,
        fileType: this.getFileType(file.name)
      };
      
      // Create sections by paragraphs
      const paragraphs = textContent.split(/\n{2,}/);
      const sections = [];
      let position = 0;
      
      for (const paragraph of paragraphs) {
        if (paragraph.trim()) {
          const content = paragraph.trim();
          sections.push({
            id: generateId(),
            type: 'paragraph',
            content,
            position: {
              start: position,
              end: position + content.length
            }
          });
          
          position += content.length + 1; // +1 for newline
        }
      }
      
      console.log("Office document parsing complete:", file.name);
      return {
        content: textContent,
        metadata,
        sections,
        filename: file.name,
        fileType: this.getFileType(file.name),
        fileSize: file.size,
      };
    } catch (error) {
      console.error("Error parsing office document:", error);
      throw new Error(`Failed to parse ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Extract plain text from HTML content
   */
  extractTextFromHtml(html) {
    // Basic HTML to text conversion
    // Remove HTML tags, preserve line breaks for paragraphs and line items
    let text = html
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<li>/gi, '• ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n');
    
    // Remove all remaining HTML tags
    text = text.replace(/<[^>]*>/g, '');
    
    // Decode HTML entities
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    
    // Normalize whitespace
    text = text
      .replace(/\n{3,}/g, '\n\n')  // Replace multiple newlines with just two
      .replace(/[ \t]+/g, ' ')     // Replace multiple spaces/tabs with a single space
      .trim();
    
    return text;
  }
}

// Export an instance of the parser
export const officeParser = new OfficeParser();
export default officeParser;
