import {BaseMessage} from '../../domain/interfaces/ILLMService'
import {ITicketRepository} from '../../domain/interfaces/ITicketRepository'
import { IRoutingStrategy, RouteResponse } from './IRoutingStrategy'

export class EscalationStrategy implements IRoutingStrategy {
    constructor (private ticketRepo: ITicketRepository){}

    async execute(query: string, chatHistory: BaseMessage[]): Promise<RouteResponse>{

        const ticketData = {
            userId: 'mock-user-123',
            query: query,
            chatHistory: chatHistory,
            status: 'OPEN' as const
        };

        const ticketId = await this.ticketRepo.createTicket(ticketData);

        return {
            response: `I understand you need further assistance. I have opened a support ticket (ID: ${ticketId}) and a human agent will be with you shortly.`,
            escalated: true,
            confidenceScore: 1.0
        }
    }
}