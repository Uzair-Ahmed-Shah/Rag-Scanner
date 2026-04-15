export interface IDocumentChunk{
    id?:string;
    text: string;
    metadata: Record<string, any>
    embedding?: number [];
}

export interface IVectorStore{
    upsertChunks (chunks: IDocumentChunk[]): Promise<void>;
    similaritySearch(queryEmbedding: number[], topK?:number): Promise<IDocumentChunk[]>
}