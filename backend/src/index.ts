import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import multer from 'multer';

import { OpenAIService } from './infrastructure/llm/OpenAIService';
import { SupabaseVectorStore} from './infrastructure/database/SupabaseVectorStore'
import {SupabaseTicketRepository} from './infrastructure/database/SupabaseTicketRepository';
import {TransformersEmbeddingService} from './infrastructure/embeddings/TransformersEmbeddingService'
import { PdfParseService} from './infrastructure/parsing/PdfParseService';
import {SentenceAwareSplitter} from './infrastructure/parsing/SentenceAwareSplitter';
import { createClient } from '@supabase/supabase-js';
import {GreetingStrategy} from './application/strategies/GreetingStrategy';
import {EscalationStrategy} from './application/strategies/EscalationStrategy'
import {RagStrategy} from './application/strategies/RagStrategy'
import {IntentRouter} from './application/IntentRouter';
import {DocumentIngestionService} from './application/DocumentIngestionService'
import {ChatController} from './presentation/ChatController'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json());

const upload = multer({storage: multer.memoryStorage()})

const supabaseClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
const llmService = new OpenAIService(process.env.GROQ_API_KEY!);
const vectorStore = new SupabaseVectorStore(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
const ticketRepo = new SupabaseTicketRepository(supabaseClient);

const embeddingService = new TransformersEmbeddingService();
const pdfParser = new PdfParseService();
const textSplitter = new SentenceAwareSplitter();

const greetingStrategy = new GreetingStrategy(llmService);
const escalationStrategy = new EscalationStrategy(ticketRepo);
const ragStrategy = new RagStrategy(llmService, vectorStore, embeddingService, escalationStrategy);
const intentRouter = new IntentRouter(llmService, ragStrategy, escalationStrategy, greetingStrategy);
const ingestionService = new DocumentIngestionService(pdfParser, textSplitter, embeddingService, vectorStore);

const chatController = new ChatController(intentRouter, ingestionService);

app.post('/api/chat', chatController.handleChat)
app.post('/api/upload', upload.single('document'), chatController.handleFileUpload)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Agentic Rag running on  http://localhost:${PORT}`)
})
