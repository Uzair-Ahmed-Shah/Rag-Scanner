import {ILLMService, BaseMessage} from '../../domain/interfaces/ILLMService'
import {IVectorStore, IDocumentChunk} from '../../domain/interfaces/VectorStoreInterface'
import { IEmbeddingService } from '../../domain/interfaces/IEmbeddingService'
import {IRoutingStrategy, RouteResponse } from './IRoutingStrategy'

interface RelevanceGrade {
    isRelevant: boolean;
    reasoning: string;
}

export class RagStrategy implements IRoutingStrategy {
    constructor (
        private llmService: ILLMService,
        private vectorStore: IVectorStore,
        private embeddingService: IEmbeddingService,
        private fallbackStrategy: IRoutingStrategy
    ) {}

    async execute(query: string, chatHistory: BaseMessage[], userId?: string): Promise<RouteResponse> {
        const _userId = userId || "mock-user-123";
        const queryVector = await this.embeddingService.generateEmbedding(query);
        const retrievedChunksRaw = await this.vectorStore.similaritySearch(queryVector, 15, _userId);
        
        const retrievedChunks: IDocumentChunk[] = [];
        const seenTexts = new Set<string>();
        for (const chunk of retrievedChunksRaw) {
            if (!seenTexts.has(chunk.text)) {
                seenTexts.add(chunk.text);
                retrievedChunks.push(chunk);
                if (retrievedChunks.length >= 5) break;
            }
        }

        const contextText = retrievedChunks.map(chunks => chunks.text).join('\n\n');

        const gradePrompt = `
            You are a strict relevance grader. 
            User Query: "${query}"
            Retrieved Documents: """${contextText}"""
            
            Does the retrieved document text contain enough information to accurately answer the user query?
            Return a JSON object with 'isRelevant' (boolean) and a brief 'reasoning' (string).
        `

        const grade = await this.llmService.generateStructuredOutput<RelevanceGrade>(
            [{role:'system', content: gradePrompt}],
            {type: 'object' , properties: {isRelevant: {type: 'boolean'}, reasoning: {type: 'string'}}}
        )

        if (!grade.isRelevant){
            console.log(`[RAG Agent] Context irrelevant. Reason: ${grade.reasoning}. Escalating...`);
            const fallbackResponse = await this.fallbackStrategy.execute(query, chatHistory);
            // @ts-ignore
            fallbackResponse.debug_rag = {
                contextTextLength: contextText.length,
                retrievedChunksCount: retrievedChunks.length,
                reasoning: grade.reasoning,
                chunks: retrievedChunks
            };
            return fallbackResponse;
        }

        const answerPrompt = `
            You are a helpful corporate assistant. Answer the user's query ONLY using the context provided.
            Do not make up information.
            
            Context: """${contextText}"""
        `

        const finalMessages: BaseMessage[] = [
            {role: 'system', content: answerPrompt},
            {role: 'user', content: query}
        ]


        const finalAnswer = await this.llmService.generateCompletion(finalMessages, 0.1);

        return {
            response: finalAnswer,
            escalated: false,
            confidenceScore: 0.9,
            // @ts-ignore
            debug_rag: {
                retrievedChunksCount: retrievedChunks.length,
                chunks: retrievedChunks
            }
        }
    }
}