/**
 * Parsers Index
 * 
 * This file exports all document parsers and initializes the parser registry.
 */

import { parserRegistry } from './ParserRegistry.js';
import { txtParser } from './TXTParser.js';

// For now, let's just register the TXT parser to get things working
parserRegistry.register(txtParser);

// As we convert more parsers, we'll add them here
// parserRegistry.register(pdfParser);
// parserRegistry.register(docxParser);
// parserRegistry.register(csvParser);
// parserRegistry.register(xlsxParser);

// Export the registry and individual parsers
export { parserRegistry, txtParser };

// Default export for convenience
export default parserRegistry;
