/**
 * Parsers Index
 * 
 * This file exports all document parsers and initializes the parser registry.
 */

import { parserRegistry } from './ParserRegistry.js';
import { txtParser } from './TXTParser.js';
import { pdfParser } from './PDFParser.js';
import { docxParser } from './DOCXParser.js';
import { csvParser } from './CSVParser.js';
import { xlsxParser } from './XLSXParser.js';

// Register all parsers
parserRegistry.register(txtParser);
parserRegistry.register(pdfParser);
parserRegistry.register(docxParser);
parserRegistry.register(csvParser);
parserRegistry.register(xlsxParser);

// Export the registry and individual parsers
export { 
  parserRegistry,
  txtParser,
  pdfParser,
  docxParser,
  csvParser,
  xlsxParser
};

// Default export for convenience
export default parserRegistry;
