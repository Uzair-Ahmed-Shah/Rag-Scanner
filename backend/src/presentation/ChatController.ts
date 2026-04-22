import { Request, Response } from 'express';
import {IntentRouter} from '../application/IntentRouter';
import {DocumentIngestionService} from '../application/DocumentIngestionService'
import { IVectorStore } from '../domain/interfaces/VectorStoreInterface';

export class ChatController {
    constructor (
        private intentRouter: IntentRouter,
        private ingestionService : DocumentIngestionService,
        private vectorStore: IVectorStore
    ){}

    handleChat = async (req: Request, res: Response): Promise<void> => {
        try{
            const userId = (req as any).userId;
            const { query } = req.body;

            if (!query) {
                res.status(400).json({error: "Query is required"})
                return
            }

            const result = await this.intentRouter.routeQuery(query, userId);
            res.status(200).json(result);
        }catch(error: any){
            console.error('Chat error:', error)
            res.status(500).json({error: error.message || "Internal server error"})
        }
    };

    handleFileUpload = async (req: Request, res: Response) : Promise<void> => {
        try{
            const file = req.file;
            const userId = (req as any).userId;
            
            if (!file ) {
                res.status(400).json({error:"PDF file is required"})
                return 
            }
            await this.ingestionService.processPdfBuffer(file.buffer, file.originalname, userId)
            
            res.status(200).json({ message: "File ingested and vectorized successfully." });
        }catch (error: any) {
            console.error("Upload Error:", error);
            res.status(500).json({error: error.message || "Internal server error during ingestion"})
        }
    }

    handleListDocuments = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).userId;
            const documents = await this.vectorStore.listDocuments(userId);
            res.status(200).json({ documents });
        } catch (error: any) {
            console.error('List Documents Error:', error);
            res.status(500).json({ error: error.message || 'Failed to list documents' });
        }
    }

    handleDeleteDocument = async (req: Request, res: Response): Promise<void> => {
        try {
            const documentId = req.params.id as string;
            if (!documentId) {
                res.status(400).json({ error: 'Document ID is required' });
                return;
            }
            await this.vectorStore.deleteDocument(documentId);
            res.status(200).json({ message: 'Document deleted successfully' });
        } catch (error: any) {
            console.error('Delete Document Error:', error);
            res.status(500).json({ error: error.message || 'Failed to delete document' });
        }
    }
}