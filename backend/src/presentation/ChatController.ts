import { Request, Response } from 'express';
import {IntentRouter} from '../application/IntentRouter';
import {DocumentIngestionService} from '../application/DocumentIngestionService'

export class ChatController {
    constructor (
        private intentRouter: IntentRouter,
        private ingestionService : DocumentIngestionService
    ){}

    handleChat = async (req: Request, res: Response): Promise<void> => {
        try{
            const { query, userId } = req.body;

            if (!query) {
                res.status(400).json({error: "Query is required"})
                return
            }

            const result = await this.intentRouter.routeQuery(query, userId);
            res.status(200).json(result);
        }catch(error: any){
            console.error('Chat error:', error)
            res.status(500).json({error: error.message || "Internalserver error"})
        }
    };

    handleFileUpload = async (req: Request, res: Response) : Promise<void> => {
        try{
            const file = req.file;
            const userId = req.body.userId;
            
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
}