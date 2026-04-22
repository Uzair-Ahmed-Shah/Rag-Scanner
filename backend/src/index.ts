import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';

import { OpenAIService } from './infrastructure/llm/OpenAIService';
import { SupabaseVectorStore } from './infrastructure/database/SupabaseVectorStore';
import { SupabaseTicketRepository } from './infrastructure/database/SupabaseTicketRepository';
import { SupabaseUserRepository } from './infrastructure/database/SupabaseUserRepository';
import { TransformersEmbeddingService } from './infrastructure/embeddings/TransformersEmbeddingService';
import { PdfParseService } from './infrastructure/parsing/PdfParseService';
import { SentenceAwareSplitter } from './infrastructure/parsing/SentenceAwareSplitter';
import { createClient } from '@supabase/supabase-js';
import { GreetingStrategy } from './application/strategies/GreetingStrategy';
import { EscalationStrategy } from './application/strategies/EscalationStrategy';
import { RagStrategy } from './application/strategies/RagStrategy';
import { IntentRouter } from './application/IntentRouter';
import { DocumentIngestionService } from './application/DocumentIngestionService';
import { ChatController } from './presentation/ChatController';
import { authMiddleware, requireAuth, signToken } from './infrastructure/auth/AuthMiddleware';
import { rateLimiter } from './infrastructure/RateLimiter';

dotenv.config();

// ─── Validate Environment ────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GROQ_API_KEY) {
    console.error('FATAL: Missing required environment variables.');
    process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(authMiddleware);

const upload = multer({ storage: multer.memoryStorage() });

// ─── Infrastructure ──────────────────────────────────────────────────────────
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const llmService = new OpenAIService(GROQ_API_KEY);
const vectorStore = new SupabaseVectorStore(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const ticketRepo = new SupabaseTicketRepository(supabaseClient);
const userRepo = new SupabaseUserRepository(supabaseClient);
const embeddingService = new TransformersEmbeddingService();
const pdfParser = new PdfParseService();
const textSplitter = new SentenceAwareSplitter();

// ─── Application ─────────────────────────────────────────────────────────────
const greetingStrategy = new GreetingStrategy(llmService);
const escalationStrategy = new EscalationStrategy(ticketRepo);
const ragStrategy = new RagStrategy(llmService, vectorStore, embeddingService, escalationStrategy);
const intentRouter = new IntentRouter(llmService, ragStrategy, escalationStrategy, greetingStrategy);
const ingestionService = new DocumentIngestionService(pdfParser, textSplitter, embeddingService, vectorStore);
const chatController = new ChatController(intentRouter, ingestionService, vectorStore);

// ─── Rate Limit Middleware ────────────────────────────────────────────────────
function applyRateLimit(req: Request, res: Response, next: NextFunction): void {
    const userId = (req as any).userId;
    if (!userId) { next(); return; }
    try {
        rateLimiter.check(userId);
        next();
    } catch (err: any) {
        res.status(429).json({
            error: err.message,
            retryAfter: err.retryAfter ?? null,
            limitType: err.type ?? 'unknown',
        });
    }
}

// ─── Auth Routes (Public) ─────────────────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            res.status(400).json({ error: 'Email, password, and name are required' });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters' });
            return;
        }
        const { userId } = await userRepo.signup(email, password, name);
        const token = signToken({ userId, email });
        res.status(201).json({ userId, name, email, token });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const { userId, name } = await userRepo.login(email, password);
        const token = signToken({ userId, email });
        res.status(200).json({ userId, name, email, token });
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
});

// ─── Chat & Documents (Protected + Rate Limited) ──────────────────────────────
app.post('/api/chat', requireAuth, applyRateLimit, chatController.handleChat);
app.post('/api/upload', requireAuth, applyRateLimit, upload.single('document'), chatController.handleFileUpload);
app.get('/api/documents', requireAuth, chatController.handleListDocuments);
app.delete('/api/documents/:id', requireAuth, chatController.handleDeleteDocument);

// ─── Tickets (Protected) ──────────────────────────────────────────────────────
app.get('/api/tickets', requireAuth, async (req, res) => {
    try {
        const userId = (req as any).userId;
        const tickets = await ticketRepo.listTickets(userId);
        res.status(200).json({ tickets });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/tickets/:id/close', requireAuth, async (req, res) => {
    try {
        const userId = (req as any).userId;
        const ticketId = req.params.id as string;
        await ticketRepo.closeTicket(ticketId, userId);
        res.status(200).json({ message: 'Ticket closed' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ─── Rate Limit Status ────────────────────────────────────────────────────────
app.get('/api/rate-limit/status', requireAuth, (req, res) => {
    const userId = (req as any).userId;
    const status = rateLimiter.getStatus(userId);
    res.status(200).json(status);
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Agentic Rag running on  http://localhost:${PORT}`);
});
