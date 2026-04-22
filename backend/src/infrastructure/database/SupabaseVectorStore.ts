import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IVectorStore, IDocumentChunk, IDocumentRecord } from '../../domain/interfaces/VectorStoreInterface';

export class SupabaseVectorStore implements IVectorStore {
    private client: SupabaseClient;

    constructor(url: string, key: string) {
        this.client = createClient(url, key);
    }

    /**
     * Ensures a user record exists in the `users` table.
     * The `documents` table has a FK to `users(user_id)`, so we must
     * register the user before inserting any documents.
     */
    private async ensureUserExists(userId: string): Promise<void> {
        const { error } = await this.client
            .from('users')
            .upsert(
                { user_id: userId, email: `${userId}@rag-scanner.local` },
                { onConflict: 'user_id' }
            );

        if (error) {
            console.error("Supabase Ensure User Error:", error);
            throw new Error("Failed to ensure user exists in Supabase");
        }
    }

    async registerDocument(userId: string, fileName: string): Promise<string> {
        // Ensure the user exists (satisfies FK constraint)
        await this.ensureUserExists(userId);

        // Delete the old document if it exists (ON DELETE CASCADE will automatically wipe old chunks)
        await this.client
            .from('documents')
            .delete()
            .match({ user_id: userId, file_name: fileName });

        // Insert the new document record and fetch its new ID
        const { data, error } = await this.client
            .from('documents')
            .insert({ user_id: userId, file_name: fileName })
            .select('document_id')
            .single();

        if (error || !data) {
            console.error("Supabase Register Document Error:", error);
            throw new Error("Failed to register document in Supabase");
        }

        return data.document_id;
    }

    async upsertChunks (chunks: IDocumentChunk[]): Promise<void> {
        const payload = chunks.map(chunk => ({
            document_id: chunk.documentId, // Map our new document constraint
            content: chunk.text,
            metadata: chunk.metadata,
            embedding: chunk.embedding
        }));

        const { error } = await this.client
        .from('document_chunks')
        .insert(payload); // Change from upsert to insert since chunks are brand new

        if (error) {
            console.error("Supabase Upsert Error:", error);
            throw new Error("Failed to save chunks to Supabase");

        }
    }
    async similaritySearch (queryEmbedding: number[], topK: number = 5, userId: string): Promise<IDocumentChunk[]> {
        const { data, error } = await this.client.rpc('match_document_chunks', {
            query_embedding: queryEmbedding,
            match_threshold: 0.1, // Lowered from 0.5 to 0.1 to allow more relaxed math matches
            match_count: topK,
            search_user_id: userId // Inject multi-tenant restriction
        })

        if (error) {
            console.error('Supabase Search Error:', error)
            throw new Error("Failed to search vectors in Supabase");
        }

        return (data || []).map((row: any) => ({
            id: row.chunk_id?.toString(),
            text: row.content,
            metadata: row.metadata
        }));

    }

    async listDocuments(userId: string): Promise<IDocumentRecord[]> {
        const { data, error } = await this.client
            .from('documents')
            .select('document_id, file_name, upload_date')
            .eq('user_id', userId)
            .order('upload_date', { ascending: false });

        if (error) {
            console.error('Supabase List Documents Error:', error);
            throw new Error('Failed to list documents');
        }

        return (data || []).map((row: any) => ({
            documentId: row.document_id,
            fileName: row.file_name,
            uploadDate: row.upload_date,
        }));
    }

    async deleteDocument(documentId: string): Promise<void> {
        const { error } = await this.client
            .from('documents')
            .delete()
            .eq('document_id', documentId);

        if (error) {
            console.error('Supabase Delete Document Error:', error);
            throw new Error('Failed to delete document');
        }
    }
}