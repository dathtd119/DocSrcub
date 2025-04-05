/**
 * Parsers Index
 * 
 * This file exports all document parsers and initializes the parser registry.
 */

import { parserRegistry } from './ParserRegistry';
import { pdfParser } from './PDFParser';
import { docxParser } from './DOCXParser';
import { txtParser } from './TXTParser';
import { csvParser } from './CSVParser';
import { xlsxParser } from './XLSXParser';

// Register all parsers
parserRegistry.register(pdfParser);
parserRegistry.register(docxParser);
parserRegistry.register(txtParser);
parserRegistry.register(csvParser);
parserRegistry.register(xlsxParser);

// Export the registry and individual parsers
export { parserRegistry };
export { pdfParser, docxParser, txtParser, csvParser, xlsxParser };

// Default export for convenience
export default parserRegistry;
