/**
 * XLSX Parser
 * 
 * Handles parsing of Excel spreadsheet files using SheetJS
 */

import * as XLSX from 'xlsx';
import { generateId } from '../utils.js';

export class XLSXParser {
  constructor() {
    this.fileType = 'xlsx';
  }
  
  /**
   * Check if this parser supports the given file
   */
  supports(file) {
    return file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
           file.name.toLowerCase().endsWith('.xlsx') ||
           file.type === 'application/vnd.ms-excel' ||
           file.name.toLowerCase().endsWith('.xls');
  }
  
  /**
   * Parse an Excel file and extract its content
   */
  async parse(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Parse the workbook
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Initialize metadata
      const metadata = {
        wordCount: 0,
        characterCount: 0,
      };
      
      // Process sections (each sheet as a section)
      const sections = [];
      let fullText = '';
      
      // Process each sheet
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        
        // Convert sheet to JSON
        const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        // Skip empty sheets
        if (sheetData.length === 0) continue;
        
        // Add sheet name as a heading
        const sheetHeading = `Sheet: ${sheetName}`;
        const sheetStartPos = fullText.length;
        
        sections.push({
          id: generateId(),
          type: 'heading',
          content: sheetHeading,
          position: {
            start: sheetStartPos,
            end: sheetStartPos + sheetHeading.length,
          },
        });
        
        fullText += sheetHeading + '\n';
        metadata.wordCount += sheetHeading.split(/\s+/).filter(Boolean).length;
        metadata.characterCount += sheetHeading.length;
        
        // Process rows
        for (const row of sheetData) {
          if (!Array.isArray(row) || row.length === 0) continue;
          
          // Convert row to text
          const rowText = row.map(cell => {
            // Handle different cell types
            if (cell === null || cell === undefined) return '';
            if (typeof cell === 'object' && cell instanceof Date) return cell.toLocaleString();
            return String(cell);
          }).join('\t');
          
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
            metadata.characterCount += rowText.length;
          }
        }
        
        // Add a blank line between sheets
        fullText += '\n';
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
      console.error("Error parsing XLSX:", error);
      throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export an instance of the parser
export const xlsxParser = new XLSXParser();
export default xlsxParser;
