import { ticketController } from '@/controllers';
import { withAuth } from '@/middleware/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    return ticketController.getTicketById(req, { params });
}

export const PATCH = withAuth(async (req: any, { params }: { params: Promise<{ id: string }> }) => {
    return ticketController.updateTicket(req, { params });
});

export const DELETE = withAuth(async (req: any, { params }: { params: Promise<{ id: string }> }) => {
    return ticketController.deleteTicket(req, { params });
});
