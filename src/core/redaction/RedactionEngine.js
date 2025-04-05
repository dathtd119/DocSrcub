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

    // Group items by type: custom items and regular items
    const customItems = itemsToRedact.filter(item => item.isCustom);
    const regularItems = itemsToRedact.filter(item => !item.isCustom);
    
    console.log(`Processing ${regularItems.length} regular items and ${customItems.length} custom items`);

    // Apply redactions for regular items that have positions
    for (const section of redactedDocument.sections) {
      const sectionItems = regularItems.filter(item => 
        item.positions.some(pos => pos.sectionId === section.id)
      );
      
      if (sectionItems.length > 0) {
        section.content = this.redactText(section.content, sectionItems, options);
      }
    }

    // Apply redactions for custom items to all sections (global search)
    if (customItems.length > 0) {
      for (const section of redactedDocument.sections) {
        section.content = this.redactCustomText(section.content, customItems, options);
      }
    }

    // Rebuild full content from sections
    redactedDocument.content = redactedDocument.sections
      .map(section => section.content)
      .join('\n');

    return redactedDocument;
  }

  /**
   * Apply redactions to a specific text string (for regular items)
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
   * Apply redactions for custom text items (global search)
   */
  redactCustomText(text, customItems, options) {
    let redactedText = text;
    
    for (const item of customItems) {
      const { caseSensitive, wholeWord, method, replacementText, preserveLength } = options;
      
      // For custom items, we search the text directly
      const pattern = this.buildSearchPattern(item.text, { caseSensitive, wholeWord });
      const replacement = this.buildReplacement(item.text, method, replacementText, preserveLength);
      
      console.log(`Redacting custom text: ${item.text}`);
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
