export interface IDocumentChunk{
    id?:string;
    documentId?: string;
    text: string;
    metadata: Record<string, any>
    embedding?: number [];
}

export interface IDocumentRecord {
    documentId: string;
    fileName: string;
    uploadDate: string;
}

export interface IVectorStore{
    registerDocument(userId: string, fileName: string): Promise<string>;
    upsertChunks (chunks: IDocumentChunk[]): Promise<void>;
    similaritySearch(queryEmbedding: number[], topK: number, userId: string): Promise<IDocumentChunk[]>;
    listDocuments(userId: string): Promise<IDocumentRecord[]>;
    deleteDocument(documentId: string): Promise<void>;
}