import { SupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export class SupabaseUserRepository {
    constructor(private client: SupabaseClient) {}

    async signup(email: string, password: string, name: string): Promise<{ userId: string }> {
        // Check if email already exists
        const { data: existing } = await this.client
            .from('users')
            .select('user_id')
            .eq('email', email.toLowerCase())
            .single();

        if (existing) {
            throw new Error('Email already registered');
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const userId = crypto.randomUUID();

        const { error } = await this.client
            .from('users')
            .insert({
                user_id: userId,
                email: email.toLowerCase(),
                password_hash: passwordHash,
                name: name.trim(),
            });

        if (error) {
            console.error('Signup DB Error:', error);
            throw new Error('Failed to create account');
        }

        return { userId };
    }

    async login(email: string, password: string): Promise<{ userId: string; name: string }> {
        const { data: user, error } = await this.client
            .from('users')
            .select('user_id, password_hash, name')
            .eq('email', email.toLowerCase())
            .single();

        if (error || !user) {
            throw new Error('Invalid email or password');
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            throw new Error('Invalid email or password');
        }

        return { userId: user.user_id, name: user.name || email.split('@')[0]! };
    }

    async getUserById(userId: string): Promise<{ userId: string; email: string; name: string } | null> {
        const { data, error } = await this.client
            .from('users')
            .select('user_id, email, name')
            .eq('user_id', userId)
            .single();

        if (error || !data) return null;

        return { userId: data.user_id, email: data.email, name: data.name || '' };
    }
}
