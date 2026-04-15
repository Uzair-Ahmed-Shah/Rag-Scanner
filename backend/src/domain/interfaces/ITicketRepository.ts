import {BaseMessage} from '../../domain/interfaces/ILLMService'

export interface ISupportTicket {
    id?: string;
    userId: string;
    query: string;
    chatHistory: BaseMessage[];
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    createdAt: Date;
}
export interface ITicketRepository {
    createTicket (ticket: Omit <ISupportTicket, 'id' | 'createdAt'>): Promise<string>
}