import {BaseMessage} from '../../domain/interfaces/ILLMService'

export interface RouteResponse {
    response : string;
    escalated: boolean;
    confidenceScore?: number;
}

export interface IRoutingStrategy {
    execute (query: string, chatHistory: BaseMessage[], userId?: string): Promise<RouteResponse>
}