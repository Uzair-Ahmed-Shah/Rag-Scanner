import pdfParse from 'pdf-parse'
import { IPdfParser } from '../../domain/interfaces/IPdfParser'

export class PdfParseService implements IPdfParser {
    async parse(buffer: Buffer): Promise<string> {
        try {
            const data = await pdfParse(buffer);

            const cleanText = data.text
                .replace(/\u0000/g, '') // Remove null bytes
                .replace(/\n\s*\n/g, '\n\n') // Normalize paragraph breaks
                .trim();

            return cleanText
        }catch(error){
            console.error('PDF Parsing Error:', error);
            throw new Error('Failed to extract text from PDF');
        }
    }
}