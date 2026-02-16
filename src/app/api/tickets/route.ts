import { ticketController } from '@/controllers';
import { withAuth } from '@/middleware/auth';

export async function GET(req: Request) {
    return ticketController.getTickets(req);
}

export const POST = withAuth(async (req: any) => {
    return ticketController.createTicket(req);
});
