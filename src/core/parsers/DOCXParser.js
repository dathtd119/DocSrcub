/**
 * DOCX Parser
 * 
 * Handles parsing of DOCX documents using mammoth.js
 */

import mammoth from 'mammoth';
import { generateId } from '../utils.js';

export class DOCXParser {
  constructor() {
    this.fileType = 'docx';
  }
  
  /**
   * Check if this parser supports the given file
   */
  supports(file) {
    return file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
           file.name.toLowerCase().endsWith('.docx') ||
           file.type === 'application/msword' ||
           file.name.toLowerCase().endsWith('.doc');
  }
  
  /**
   * Parse a DOCX file and extract its content
   */
  async parse(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Use mammoth to convert DOCX to HTML
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      
      // Extract text content from HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Initialize metadata
      const metadata = {
        wordCount: 0,
        characterCount: 0,
      };
      
      // Process sections
      const sections = [];
      let fullText = '';
      
      // Process paragraphs
      const paragraphs = tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, ol, table');
      paragraphs.forEach(para => {
        const text = para.textContent || '';
        if (text.trim()) {
          const startPos = fullText.length;
          const sectionText = text.trim();
          
          let type = 'paragraph';
          if (para.tagName.toLowerCase().startsWith('h')) {
            type = 'heading';
          } else if (para.tagName.toLowerCase() === 'ul' || para.tagName.toLowerCase() === 'ol') {
            type = 'list';
          } else if (para.tagName.toLowerCase() === 'table') {
            type = 'table';
          }
          
          sections.push({
            id: generateId(),
            type,
            content: sectionText,
            position: {
              start: startPos,
              end: startPos + sectionText.length,
            },
          });
          
          fullText += sectionText + '\n';
          metadata.wordCount += sectionText.split(/\s+/).filter(Boolean).length;
          metadata.characterCount += sectionText.length;
        }
      });
      
      // Extract metadata from mammoth if available
      try {
        if (result.messages && result.messages.length > 0) {
          // Sometimes mammoth includes metadata in messages
          for (const message of result.messages) {
            if (message.message && message.message.includes('property:')) {
              const property = message.message.split('property:')[1].trim();
              if (property.includes('title')) {
                metadata.title = property.split('value:')[1].trim();
              } else if (property.includes('author')) {
                metadata.author = property.split('value:')[1].trim();
              }
            }
          }
        }
      } catch (error) {
        console.warn("Failed to parse DOCX metadata:", error);
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
      console.error("Error parsing DOCX:", error);
      throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export an instance of the parser
export const docxParser = new DOCXParser();
export default docxParser;
