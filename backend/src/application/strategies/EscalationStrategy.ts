import {BaseMessage} from '../../domain/interfaces/ILLMService'
import {ITicketRepository} from '../../domain/interfaces/ITicketRepository'
import { IRoutingStrategy, RouteResponse } from './IRoutingStrategy'

export class EscalationStrategy implements IRoutingStrategy {
    constructor (private ticketRepo: ITicketRepository){}

    async execute(query: string, chatHistory: BaseMessage[], userId?: string): Promise<RouteResponse>{
        if (!userId) {
            throw new Error('userId is required for escalation');
        }

        const ticketId = await this.ticketRepo.createTicket({
            userId,
            query,
            chatHistory,
            status: 'OPEN' as const
        });

        return {
            response: `Your query has been escalated. A support ticket has been created.`,
            escalated: true,
            confidenceScore: 1.0,
            // @ts-ignore
            ticketId,
        };
    }
}