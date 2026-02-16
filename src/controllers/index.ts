import { NextResponse } from 'next/server';
import { authService } from '@/services/AuthService';
import { ticketService } from '@/services/TicketService';
import { AuthenticatedRequest } from '@/middleware/auth';

export class AuthController {
    async register(req: Request) {
        try {
            const body = await req.json();
            const result = await authService.register(body);
            return NextResponse.json(result, { status: 201 });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
    }

    async login(req: Request) {
        try {
            const body = await req.json();
            const result = await authService.login(body.email, body.password);
            return NextResponse.json(result);
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
    }

    async getMe(req: AuthenticatedRequest) {
        try {
            return NextResponse.json({ user: req.user });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
    }
}

export class TicketController {
    async getTickets(req: Request) {
        try {
            const { searchParams } = new URL(req.url);
            const params = {
                page: parseInt(searchParams.get('page') || '1'),
                limit: parseInt(searchParams.get('limit') || '10'),
                search: searchParams.get('search') || undefined,
                status: searchParams.get('status') || undefined,
                sortField: searchParams.get('sortField') || 'createdAt',
                sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
            };
            const result = await ticketService.getTickets(params);
            return NextResponse.json(result);
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
    }

    async createTicket(req: AuthenticatedRequest) {
        try {
            const body = await req.json();
            const ticket = await ticketService.createTicket(body);
            return NextResponse.json(ticket, { status: 201 });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
    }

    async getTicketById(req: Request, { params }: { params: Promise<{ id: string }> }) {
        try {
            const { id } = await params;
            const ticket = await ticketService.getTicketById(id);
            return NextResponse.json(ticket);
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
    }

    async updateTicket(req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
        try {
            const { id } = await params;
            const body = await req.json();
            const ticket = await ticketService.updateTicket(id, body);
            return NextResponse.json(ticket);
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
    }

    async deleteTicket(req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
        try {
            const { id } = await params;
            await ticketService.deleteTicket(id);
            return NextResponse.json({ message: 'Ticket deleted successfully' });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
    }
}

export const authController = new AuthController();
export const ticketController = new TicketController();
