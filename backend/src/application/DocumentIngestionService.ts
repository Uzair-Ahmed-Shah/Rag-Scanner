import { IPdfParser } from '../domain/interfaces/IPdfParser'
import { ITextSplitter } from '../domain/interfaces/ITextSplitter';
import {IEmbeddingService } from '../domain/interfaces/IEmbeddingService'
import {IVectorStore, IDocumentChunk } from '../domain/interfaces/VectorStoreInterface'


export class DocumentIngestionService {
    constructor (
        private pdfParser: IPdfParser,
        private textSplitter: ITextSplitter,
        private embeddingService: IEmbeddingService,
        private vectorStore: IVectorStore
    ) {}
    async processPdfBuffer (buffer: Buffer, fileName: string): Promise<void> {
        console.log(`[Ingestion] Starting process for ${fileName}`)
        const rawText = await this.pdfParser.parse(buffer);
        console.log(`[Ingestion] Split into ${rawText.length} characters`)
        const textChunks = this.textSplitter.split(rawText, 1000, 200)
        console.log(`[Ingestion] Split into ${textChunks.length} chunks.`);

        const documentChunks: IDocumentChunk[] = [];

        for (let i = 0; i < textChunks.length; i++){
            const chunkText = textChunks[i]!;

            const vector = await this.embeddingService.generateEmbedding(chunkText);

            documentChunks.push({
                text: chunkText,
                embedding: vector,
                metadata: {
                    source:fileName,
                    chunkIndex: i,
                    totalChunks: textChunks.length
                }
            });
        }
        console.log(`[Ingestion] Completed vector generation.`);

        await this.vectorStore.upsertChunks(documentChunks);
        console.log(`[Ingestion] Successfully saved ${documentChunks.length} chunks to Supabase.`);
    }
}
