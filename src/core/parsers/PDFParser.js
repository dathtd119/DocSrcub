/**
 * PDF Parser
 * 
 * Handles parsing of PDF documents using pdf.js
 */

// Import pdfjs using the webpack approach which automatically configures the worker
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { generateId } from '../utils.js';

// Configure worker source only on the client-side using an IIAFE
(async () => {
  if (!import.meta.env.SSR) {
    try {
      // Import the worker path using Vite's ?url feature
      const workerSrcModule = await import('pdfjs-dist/legacy/build/pdf.worker.mjs?url');
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrcModule.default;
      console.log('PDF.js workerSrc set:', pdfjsLib.GlobalWorkerOptions.workerSrc);
    } catch (e) {
      console.error("Failed to set PDF.js workerSrc dynamically:", e);
      // Potential fallback: Manually copy pdf.worker.mjs to public/ and set:
      // pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
    }
  }
})(); // Immediately invoke the async function

export class PDFParser {
  constructor() {
    this.fileType = 'pdf';
    console.log("PDF Parser initialized with PDF.js version:", pdfjsLib.version);
  }
  
  /**
   * Check if this parser supports the given file
   */
  supports(file) {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  }
  
  /**
   * Parse a PDF file and extract its content
   */
  async parse(file) {
    try {
      console.log("Starting PDF parsing for file:", file.name);
      
      const arrayBuffer = await file.arrayBuffer();
      
      // Configure the PDF.js document loading
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        // For large documents, these options improve performance
        nativeImageDecoderSupport: 'none',
        ignoreErrors: true
      });
      
      const pdf = await loadingTask.promise;
      console.log(`PDF loaded successfully with ${pdf.numPages} pages`);
      
      const metadata = {
        pageCount: pdf.numPages,
        wordCount: 0,
        characterCount: 0,
      };
      
      const sections = [];
      let fullText = '';
      
      // Process each page
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`Processing page ${i} of ${pdf.numPages}`);
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
            if (lastY !== undefined && Math.abs(item.transform[5] - lastY) > 10) {
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
                
                fullText += sectionText + '\n';
                metadata.wordCount += sectionText.split(/\s+/).filter(Boolean).length;
                metadata.characterCount += sectionText.length;
              }
              
              pageText = text;
            } else {
              // Add space if needed
              if (pageText && !pageText.endsWith(' ')) {
                pageText += ' ';
              }
              pageText += text;
            }
            
            lastY = item.transform[5];
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
          
          fullText += sectionText + '\n';
          metadata.wordCount += sectionText.split(/\s+/).filter(Boolean).length;
          metadata.characterCount += sectionText.length;
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
      
      console.log("PDF parsing complete:", file.name);
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
  parseMetadataDate(dateString) {
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
