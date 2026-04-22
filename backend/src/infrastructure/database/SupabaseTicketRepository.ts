import { SupabaseClient } from '@supabase/supabase-js'
import { ITicketRepository, ISupportTicket, ITicketSummary } from '../../domain/interfaces/ITicketRepository'

export class SupabaseTicketRepository implements ITicketRepository {
    constructor(private client: SupabaseClient) {}

    async createTicket(ticket: Omit<ISupportTicket, 'id' | 'createdAt'>): Promise<string> {
        const { data, error } = await this.client
            .from('support_tickets')
            .insert({
                user_id: ticket.userId,
                query: ticket.query,
                chat_history: ticket.chatHistory,
                status: ticket.status,
            })
            .select('id')
            .single();

        if (error || !data) {
            console.error('Supabase Ticket Error:', error);
            throw new Error('Failed to create support ticket');
        }
        return data.id;
    }

    async listTickets(userId: string): Promise<ITicketSummary[]> {
        const { data, error } = await this.client
            .from('support_tickets')
            .select('id, query, status, created_at, closed_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase List Tickets Error:', error);
            throw new Error('Failed to list tickets');
        }

        return (data || []).map((row: any) => ({
            id: row.id,
            query: row.query,
            status: row.status,
            createdAt: row.created_at,
            closedAt: row.closed_at ?? undefined,
        }));
    }

    async closeTicket(ticketId: string, userId: string): Promise<void> {
        const { error } = await this.client
            .from('support_tickets')
            .update({ status: 'CLOSED', closed_at: new Date().toISOString() })
            .eq('id', ticketId)
            .eq('user_id', userId); // Ensures ownership

        if (error) {
            console.error('Supabase Close Ticket Error:', error);
            throw new Error('Failed to close ticket');
        }
    }
}