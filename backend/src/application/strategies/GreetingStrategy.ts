import {ILLMService, BaseMessage} from '../../domain/interfaces/ILLMService'
import { IRoutingStrategy, RouteResponse} from './IRoutingStrategy'

export class GreetingStrategy implements IRoutingStrategy {
    constructor (private llmService: ILLMService){}

    async execute (query: string, chatHistory: BaseMessage[]): Promise<RouteResponse> {
        const systemPrompt = `
            You are a helpful, professional customer support assistant. 
            The user is greeting you or making small talk.
            Respond politely and concisely in 1-2 sentences. 
            Ask how you can help them today.
        `

        const messages: BaseMessage[] = [
            {role: 'system', content: systemPrompt},
            {role: 'user', content : query}
        ];

        const responseText = await this.llmService.generateCompletion(messages, 0.5)

        return {
            response: responseText,
            escalated: false,
            confidenceScore: 1.0
        };
    }
}