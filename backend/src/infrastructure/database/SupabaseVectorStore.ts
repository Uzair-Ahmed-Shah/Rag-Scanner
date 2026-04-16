import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IVectorStore, IDocumentChunk } from '../../domain/interfaces/VectorStoreInterface';

export class SupabaseVectorStore implements IVectorStore {
    private client: SupabaseClient;

    constructor(url: string, key: string) {
        this.client = createClient(url, key);
    }

    async upsertChunks (chunks: IDocumentChunk[]): Promise<void> {
        const payload = chunks.map(chunk => ({
            content: chunk.text,
            metadata: chunk.metadata,
            embedding: chunk.embedding
        }));

        const { error } = await this.client
        .from('document_chunks')
        .upsert(payload);

        if (error) {
            console.error("Supabase Upsert Error:", error);
            throw new Error("Failed to save chunks to Supabase");

        }
    }
    async similaritySearch (queryEmbedding: number[], topK: number = 5): Promise<IDocumentChunk[]> {
        const { data, error } = await this.client.rpc('match_document_chunks', {
            query_embedding: queryEmbedding,
            match_threshold: 0.5,
            match_count: topK,
        })

        if (error) {
            console.error('Supabase Search Error:', error)
            throw new Error("Failed to search vectors in Supabase");
        }

        return data.map((row: any) => ({
            id: row.id.toString(),
            text: row.content,
            metadata: row.metadata
        }));

    }
}