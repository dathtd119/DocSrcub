/**
 * Redaction Engine
 * 
 * Handles applying redactions to document content
 */

import { escapeRegExp, generateRedactedFilename } from '../utils.js';

export class RedactionEngine {
  /**
   * Apply redactions to a document
   */
  applyRedactions(document, itemsToRedact, options) {
    // Skip if nothing to redact
    if (itemsToRedact.length === 0) {
      return document;
    }

    // Create a copy of the document to modify
    const redactedDocument = {
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
      .join('\n');

    return redactedDocument;
  }

  /**
   * Apply redactions to a specific text string
   */
  redactText(text, itemsToRedact, options) {
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
  buildSearchPattern(text, { caseSensitive, wholeWord }) {
    let pattern = escapeRegExp(text);
    
    if (wholeWord) {
      pattern = `\\b${pattern}\\b`;
    }
    
    return new RegExp(pattern, caseSensitive ? 'g' : 'gi');
  }
  
  /**
   * Build a replacement string based on redaction options
   */
  buildReplacement(original, method, replacementText, preserveLength) {
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
  async saveAsText(document) {
    const blob = new Blob([document.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = document.filename;
    a.click();
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }
  
  /**
   * Export redacted content in various formats
   */
  async exportDocument(document) {
    // For now, we'll just export as text
    // Advanced format-specific reconstruction is a more complex feature
    await this.saveAsText(document);
  }
}

// Export a singleton instance
export const redactionEngine = new RedactionEngine();
export default redactionEngine;
