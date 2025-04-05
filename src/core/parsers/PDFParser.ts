/**
 * PDF Parser
 * 
 * Handles parsing of PDF documents using pdf.js
 */

import * as pdfjs from 'pdfjs-dist';
import { DocumentParser, ParsedDocument, DocumentSection, DocumentMetadata } from '../types';
import { generateId } from '../utils';

// Set the worker path (needed for pdf.js)
const pdfjsWorker = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker.toString();

export class PDFParser implements DocumentParser {
  fileType = 'pdf' as const;
  
  /**
   * Check if this parser supports the given file
   */
  supports(file: File): boolean {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  }
  
  /**
   * Parse a PDF file and extract its content
   */
  async parse(file: File): Promise<ParsedDocument> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      const metadata: DocumentMetadata = {
        pageCount: pdf.numPages,
        wordCount: 0,
        characterCount: 0,
      };
      
      const sections: DocumentSection[] = [];
      let fullText = '';
      
      // Process each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        
        // Build page text
        let pageText = '';
        let lastY;
        
        // Process each text item
        for (const item of content.items) {
          if ('str' in item) {
            const text = item.str;
            
            // If Y position changed significantly, treat as a paragraph break
            if (lastY !== undefined && Math.abs((item as any).transform[5] - lastY) > 10) {
              // Create a section for previous paragraph
              if (pageText.trim()) {
                const startPos = fullText.length;
                const sectionText = pageText.trim();
                
                sections.push({
                  id: generateId(),
                  type: 'paragraph',
                  content: sectionText,
                  position: {
                    start: startPos,
                    end: startPos + sectionText.length,
                  },
                });
                
                fullText += sectionText + '\\n';
                metadata.wordCount! += sectionText.split(/\\s+/).filter(Boolean).length;
                metadata.characterCount! += sectionText.length;
              }
              
              pageText = text;
            } else {
              // Add space if needed
              if (pageText && !pageText.endsWith(' ')) {
                pageText += ' ';
              }
              pageText += text;
            }
            
            lastY = (item as any).transform[5];
          }
        }
        
        // Add final paragraph from the page
        if (pageText.trim()) {
          const startPos = fullText.length;
          const sectionText = pageText.trim();
          
          sections.push({
            id: generateId(),
            type: 'paragraph',
            content: sectionText,
            position: {
              start: startPos,
              end: startPos + sectionText.length,
            },
          });
          
          fullText += sectionText + '\\n';
          metadata.wordCount! += sectionText.split(/\\s+/).filter(Boolean).length;
          metadata.characterCount! += sectionText.length;
        }
      }
      
      // Get additional document metadata if available
      try {
        const metadataObj = await pdf.getMetadata();
        if (metadataObj && metadataObj.info) {
          metadata.title = metadataObj.info.Title || undefined;
          metadata.author = metadataObj.info.Author || undefined;
          metadata.createdAt = metadataObj.info.CreationDate ? 
            this.parseMetadataDate(metadataObj.info.CreationDate) : undefined;
          metadata.modifiedAt = metadataObj.info.ModDate ? 
            this.parseMetadataDate(metadataObj.info.ModDate) : undefined;
        }
      } catch (error) {
        console.warn("Failed to parse PDF metadata:", error);
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
      console.error("Error parsing PDF:", error);
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Parse PDF metadata date format
   */
  private parseMetadataDate(dateString: string): string | undefined {
    try {
      // Handle PDF date format (D:20230428120000Z)
      if (dateString.startsWith('D:')) {
        const dateStr = dateString.substring(2);
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        
        // If we have time components
        if (dateStr.length >= 14) {
          const hour = dateStr.substring(8, 10);
          const minute = dateStr.substring(10, 12);
          const second = dateStr.substring(12, 14);
          return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
        }
        
        return `${year}-${month}-${day}`;
      }
      
      // Fallback: return as is
      return dateString;
    } catch (error) {
      console.warn("Failed to parse PDF date:", error);
      return undefined;
    }
  }
}

// Export an instance of the parser
export const pdfParser = new PDFParser();
export default pdfParser;
