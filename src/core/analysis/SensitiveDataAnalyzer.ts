/**
 * Sensitive Data Analyzer
 * 
 * Analyzes document content to identify potentially sensitive information
 */

import { ParsedDocument, SensitiveItem, SensitiveCategory } from '../types';
import { generateId } from '../utils';

// Regular expressions for detecting sensitive information
const PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /(\+\d{1,3}[\s.-])?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
  ssn: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g,
  creditcard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  date: /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/g,
  // Name detection is complex, we'll use a simpler approach
  name: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
  address: /\b\d+\s+[A-Za-z\s,]+\b(?:Avenue|Lane|Road|Boulevard|Drive|Street|Ave|Dr|Rd|Blvd|Ln|St)\.?\b/gi,
};

// Common words to filter out (to reduce false positives)
const COMMON_WORDS = new Set([
  'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but',
  'his', 'her', 'she', 'they', 'them', 'from', 'will', 'would', 'there',
  'their', 'what', 'about', 'which', 'when', 'make', 'like', 'time', 'just',
  'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
  // Add more common words as needed
]);

export class SensitiveDataAnalyzer {
  private useCommonWordFiltering: boolean = true;
  
  /**
   * Analyze document content for sensitive information
   */
  analyze(document: ParsedDocument): SensitiveItem[] {
    const sensitiveItems: SensitiveItem[] = [];
    
    // Process each section of the document
    for (const section of document.sections) {
      const text = section.content;
      
      // Run each pattern detector
      this.detectPattern(text, PATTERNS.email, 'email', section.id, sensitiveItems);
      this.detectPattern(text, PATTERNS.phone, 'phone', section.id, sensitiveItems);
      this.detectPattern(text, PATTERNS.ssn, 'ssn', section.id, sensitiveItems);
      this.detectPattern(text, PATTERNS.creditcard, 'creditcard', section.id, sensitiveItems);
      this.detectPattern(text, PATTERNS.date, 'date', section.id, sensitiveItems);
      this.detectPattern(text, PATTERNS.name, 'name', section.id, sensitiveItems);
      this.detectPattern(text, PATTERNS.address, 'address', section.id, sensitiveItems);
      
      // Detect potential organizational names (capitalized phrases)
      this.detectOrganizations(text, section.id, sensitiveItems);
    }
    
    // Filter, deduplicate, and sort by confidence
    return this.processResults(sensitiveItems);
  }
  
  /**
   * Detect patterns matching the given regex
   */
  private detectPattern(
    text: string, 
    pattern: RegExp, 
    category: SensitiveCategory,
    sectionId: string,
    results: SensitiveItem[]
  ): void {
    const matches = text.matchAll(new RegExp(pattern));
    
    for (const match of matches) {
      if (!match[0] || match.index === undefined) continue;
      
      const matchText = match[0];
      
      // Skip if it's a common word and filtering is enabled
      if (this.useCommonWordFiltering && 
          category === 'name' && 
          this.isCommonWord(matchText)) {
        continue;
      }
      
      // Calculate confidence based on pattern and length
      const confidence = this.calculateConfidence(matchText, category);
      
      results.push({
        id: generateId(),
        text: matchText,
        category,
        positions: [{
          sectionId,
          start: match.index,
          end: match.index + matchText.length,
        }],
        confidence,
        selected: confidence > 0.7, // Pre-select high-confidence items
      });
    }
  }
  
  /**
   * Detect potential organization names (capitalized multi-word phrases)
   */
  private detectOrganizations(
    text: string,
    sectionId: string,
    results: SensitiveItem[]
  ): void {
    // Look for sequences of capitalized words
    const orgPattern = /\b([A-Z][a-z]+\s+){1,5}([A-Z][a-z]+\s*)+\b/g;
    const matches = text.matchAll(orgPattern);
    
    for (const match of matches) {
      if (!match[0] || match.index === undefined) continue;
      
      const matchText = match[0].trim();
      
      // Skip short matches or those that might be sentence starts
      if (matchText.length < 10 || matchText.split(/\\s+/).length < 2) {
        continue;
      }
      
      // Skip if already detected as a name
      if (results.some(item => 
        item.category === 'name' && 
        item.text === matchText
      )) {
        continue;
      }
      
      results.push({
        id: generateId(),
        text: matchText,
        category: 'organization',
        positions: [{
          sectionId,
          start: match.index,
          end: match.index + matchText.length,
        }],
        confidence: 0.6,
        selected: false,
      });
    }
  }
  
  /**
   * Calculate confidence score for a detected item
   */
  private calculateConfidence(text: string, category: SensitiveCategory): number {
    switch (category) {
      case 'email':
        return text.includes('@') && text.includes('.') ? 0.95 : 0.5;
        
      case 'phone':
        // More digits = higher confidence
        return text.replace(/\\D/g, '').length >= 10 ? 0.9 : 0.7;
        
      case 'ssn':
        return text.replace(/\\D/g, '').length === 9 ? 0.95 : 0.7;
        
      case 'creditcard':
        // Simple Luhn algorithm check would be better
        return text.replace(/\\D/g, '').length >= 15 ? 0.9 : 0.6;
        
      case 'name':
        // Names are trickier, use length and capitalization as heuristics
        return text.split(/\\s+/).length >= 2 ? 0.7 : 0.5;
        
      case 'address':
        // More specific address patterns get higher confidence
        return text.length > 15 ? 0.8 : 0.6;
        
      case 'date':
        return 0.7; // Medium confidence for dates
        
      default:
        return 0.5; // Default medium-low confidence
    }
  }
  
  /**
   * Check if a word is in the common word list
   */
  private isCommonWord(word: string): boolean {
    const normalizedWord = word.toLowerCase().trim();
    return COMMON_WORDS.has(normalizedWord);
  }
  
  /**
   * Process results to remove duplicates and sort by confidence
   */
  private processResults(items: SensitiveItem[]): SensitiveItem[] {
    // Deduplicate by text (keeping the highest confidence)
    const uniqueItems = new Map<string, SensitiveItem>();
    
    for (const item of items) {
      const existingItem = uniqueItems.get(item.text);
      
      if (!existingItem || item.confidence > existingItem.confidence) {
        uniqueItems.set(item.text, item);
      }
    }
    
    // Convert to array and sort by confidence (descending)
    return Array.from(uniqueItems.values())
      .sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Set whether to use common word filtering
   */
  setUseCommonWordFiltering(value: boolean): void {
    this.useCommonWordFiltering = value;
  }
}

// Export a singleton instance
export const sensitiveDataAnalyzer = new SensitiveDataAnalyzer();
export default sensitiveDataAnalyzer;
