export interface BaseMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ILLMService {
    generateCompletion (messages: BaseMessage[], temperature?: number): Promise<string>;
    generateStructuredOutput<T>(messages: BaseMessage[], schema: any): Promise<T>;
}