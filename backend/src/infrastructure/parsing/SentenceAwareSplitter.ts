import { ITextSplitter } from '../../domain/interfaces/ITextSplitter'
export class SentenceAwareSplitter implements ITextSplitter {
    split(text: string, chunkSize: number, overlap: number): string[] {
        if(chunkSize <= overlap) {
            throw new Error("Chunk size mush be greater than overlap")
        }

        // Split on newlines or spaces following sentence-ending punctuation
        const sentences = text.split(/(?<=[.!?])\s+|\n+/g)
            .map(s => s.trim())
            .filter(s => s.length > 0);
        
        if (sentences.length === 0) {
            return [];
        }

        const chunks: string[] = [];
        let currentChunk = ""

        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i]!;
            
            if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                
                let overlapText = "";
                let backIndex = i - 1;
                
                while (backIndex >= 0 && overlapText.length + sentences[backIndex]!.length <= overlap) {
                    overlapText = sentences[backIndex]!.trim() + " " + overlapText;
                    backIndex--;
                }
                
                currentChunk = overlapText.trim() + " " + sentence + " ";
            } else {
                currentChunk += sentence + " ";
            }
        }

        if (currentChunk.trim().length > 0) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }
}