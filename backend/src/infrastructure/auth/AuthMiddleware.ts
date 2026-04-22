import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rag-scanner-dev-secret-change-in-production';

export interface AuthPayload {
    userId: string;
    email: string;
}

export function signToken(payload: AuthPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthPayload {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
}

/**
 * Express middleware that validates the Authorization header.
 * Attaches `req.userId` for downstream handlers.
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        // Allow unauthenticated — handlers can check req.userId
        (req as any).userId = null;
        return next();
    }

    try {
        const token = header.slice(7);
        const payload = verifyToken(token);
        (req as any).userId = payload.userId;
    } catch {
        (req as any).userId = null;
    }

    next();
}

/**
 * Guard middleware — returns 401 if not authenticated.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    if (!(req as any).userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    next();
}
