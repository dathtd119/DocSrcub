/**
 * Redaction Engine
 * 
 * Handles applying redactions to document content
 */

import { ParsedDocument, SensitiveItem, RedactionOptions, DocumentSection } from '../types';
import { escapeRegExp, generateRedactedFilename } from '../utils';
import { saveAs } from 'file-saver';

export class RedactionEngine {
  /**
   * Apply redactions to a document
   */
  applyRedactions(
    document: ParsedDocument,
    itemsToRedact: SensitiveItem[],
    options: RedactionOptions
  ): ParsedDocument {
    // Skip if nothing to redact
    if (itemsToRedact.length === 0) {
      return document;
    }

    // Create a copy of the document to modify
    const redactedDocument: ParsedDocument = {
      ...document,
      filename: generateRedactedFilename(document.filename),
      sections: [...document.sections.map(section => ({ ...section }))],
    };

    // Apply redactions to each section
    for (const section of redactedDocument.sections) {
      const sectionItems = itemsToRedact.filter(item => 
        item.positions.some(pos => pos.sectionId === section.id)
      );
      
      if (sectionItems.length > 0) {
        section.content = this.redactText(section.content, sectionItems, options);
      }
    }

    // Rebuild full content from sections
    redactedDocument.content = redactedDocument.sections
      .map(section => section.content)
      .join('\\n');

    return redactedDocument;
  }

  /**
   * Apply redactions to a specific text string
   */
  private redactText(
    text: string,
    itemsToRedact: SensitiveItem[],
    options: RedactionOptions
  ): string {
    let redactedText = text;
    
    for (const item of itemsToRedact) {
      const { caseSensitive, wholeWord, method, replacementText, preserveLength } = options;
      
      const pattern = this.buildSearchPattern(item.text, { caseSensitive, wholeWord });
      const replacement = this.buildReplacement(item.text, method, replacementText, preserveLength);
      
      redactedText = redactedText.replace(pattern, replacement);
    }
    
    return redactedText;
  }
  
  /**
   * Build a regular expression pattern for searching text
   */
  private buildSearchPattern(
    text: string, 
    { caseSensitive, wholeWord }: Pick<RedactionOptions, 'caseSensitive' | 'wholeWord'>
  ): RegExp {
    let pattern = escapeRegExp(text);
    
    if (wholeWord) {
      pattern = `\\\\b${pattern}\\\\b`;
    }
    
    return new RegExp(pattern, caseSensitive ? 'g' : 'gi');
  }
  
  /**
   * Build a replacement string based on redaction options
   */
  private buildReplacement(
    original: string,
    method: RedactionOptions['method'],
    replacementText?: string,
    preserveLength?: boolean
  ): string {
    switch (method) {
      case 'asterisks':
        return preserveLength ? '*'.repeat(original.length) : '*******';
        
      case 'blackout':
        return preserveLength ? '█'.repeat(original.length) : '█████';
        
      case 'replace':
        if (replacementText) {
          return preserveLength 
            ? replacementText.padEnd(original.length, ' ').substring(0, original.length)
            : replacementText;
        }
        return '[REDACTED]';
        
      default:
        return '[REDACTED]';
    }
  }
  
  /**
   * Save the redacted document as a text file
   */
  async saveAsText(document: ParsedDocument): Promise<void> {
    const blob = new Blob([document.content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, document.filename);
  }
  
  /**
   * Export redacted content in various formats
   */
  async exportDocument(document: ParsedDocument): Promise<void> {
    // For now, we'll just export as text
    // Advanced format-specific reconstruction is a more complex feature
    await this.saveAsText(document);
  }
}

// Export a singleton instance
export const redactionEngine = new RedactionEngine();
export default redactionEngine;
