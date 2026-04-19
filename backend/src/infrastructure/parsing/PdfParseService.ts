import { getDocumentProxy, extractText } from 'unpdf';
import { IPdfParser } from '../../domain/interfaces/IPdfParser';

export class PdfParseService implements IPdfParser {
    async parse(buffer: Buffer): Promise<string> {
        try {
            const uint8Array = new Uint8Array(buffer);
            const pdf = await getDocumentProxy(uint8Array);
            const { text } = await extractText(pdf, { mergePages: true });

            const cleanText = text
                .replace(/\u0000/g, '')
                .replace(/\n\s*\n/g, '\n\n')
                .trim();

            return cleanText;
        } catch (error) {
            console.error('PDF Parsing Error:', error);
            throw new Error(`Failed to extract text from PDF: ${(error as Error).message}`);
        }
    }
}