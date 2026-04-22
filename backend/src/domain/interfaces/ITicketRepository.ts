import {BaseMessage} from '../../domain/interfaces/ILLMService'

export interface ISupportTicket {
    id?: string;
    userId: string;
    query: string;
    chatHistory: BaseMessage[];
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    createdAt?: Date;
    closedAt?: Date;
}

export interface ITicketSummary {
    id: string;
    query: string;
    status: ISupportTicket['status'];
    createdAt: string;
    closedAt?: string;
}

export interface ITicketRepository {
    createTicket(ticket: Omit<ISupportTicket, 'id' | 'createdAt'>): Promise<string>;
    listTickets(userId: string): Promise<ITicketSummary[]>;
    closeTicket(ticketId: string, userId: string): Promise<void>;
}