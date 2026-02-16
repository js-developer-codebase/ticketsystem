import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/AuthService';

export interface AuthenticatedRequest extends NextRequest {
    user?: {
        id: string;
        email: string;
        role: string;
        name: string;
    };
}

export const withAuth = (handler: Function, roles: string[] = []) => {
    return async (req: AuthenticatedRequest, ...args: any[]) => {
        try {
            const authHeader = req.headers.get('authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const token = authHeader.split(' ')[1];
            const decoded = authService.verifyToken(token);

            if (roles.length > 0 && !roles.includes(decoded.role)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            req.user = decoded;
            return handler(req, ...args);
        } catch (error) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    };
};
