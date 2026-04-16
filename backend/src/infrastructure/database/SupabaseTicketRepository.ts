import { SupabaseClient} from '@supabase/supabase-js'
import {ITicketRepository, ISupportTicket } from '../../domain/interfaces/ITicketRepository'

export class SupabaseTicketRepository implements ITicketRepository {

    constructor (private client: SupabaseClient) {}

    async createTicket (ticket: Omit<ISupportTicket, 'id' | 'createdAt'>) : Promise<string> {
        const {data, error} = await this.client
        .from('support_tickets')
        .insert({
            user_id: ticket.userId,
            query: ticket.query,
            chat_history: ticket.chatHistory,
            status: ticket.status
        })
        .select('id')
        .single()

        if (error || !data) {
            console.error('Supabase Ticket Error:', error);
            throw new Error('Failed to create support ticket')
        }
        return data.id
    }
}