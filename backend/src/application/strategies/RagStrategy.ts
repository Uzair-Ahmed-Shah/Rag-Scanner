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

    async execute(query: string, chatHistory: BaseMessage[]): Promise<RouteResponse> {
        const queryVector = await this.embeddingService.generateEmbedding(query)
        const retrievedChunks = await this.vectorStore.similaritySearch(queryVector, 3);
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
            {role: 'user' , properties: {isRelevant: {type: 'boolean'}, reasoning: {type: 'string'}}}
        )

        if (!grade.isRelevant){
            console.log(`[RAG Agent] Context irrelevant. Reason: ${grade.reasoning}. Escalating...`);
            return await this.fallbackStrategy.execute(query, chatHistory);
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
            confidenceScore: 0.9
        }
    }
}