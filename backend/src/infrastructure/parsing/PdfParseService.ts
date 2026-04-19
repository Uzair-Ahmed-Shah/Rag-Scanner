import { getDocumentProxy, extractText } from 'unpdf';
import { IPdfParser } from '../../domain/interfaces/IPdfParser';

export class PdfParseService implements IPdfParser {
    async parse(buffer: Buffer): Promise<string> {
        try {
            // Convert Buffer to Uint8Array (required by unpdf / pdfjs-dist)
            const uint8Array = new Uint8Array(buffer);

            // Load the PDF document via pdfjs-dist under the hood
            const pdf = await getDocumentProxy(uint8Array);

            // Extract all text — mergePages concatenates every page into one string
            const { text } = await extractText(pdf, { mergePages: true });

            const cleanText = text
                .replace(/\u0000/g, '')          // Remove null bytes
                .replace(/\n\s*\n/g, '\n\n')     // Normalize paragraph breaks
                .trim();

            return cleanText;
        } catch (error) {
            console.error('PDF Parsing Error:', error);
            throw new Error(`Failed to extract text from PDF: ${(error as Error).message}`);
        }
    }
}