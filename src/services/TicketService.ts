import { ticketRepository } from '@/repositories/TicketRepository';
import { ITicket } from '@/models/Ticket';

export class TicketService {
    async getTickets(params: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        sortField?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        return ticketRepository.findAll(
            params.page,
            params.limit,
            params.search,
            params.status,
            params.sortField,
            params.sortOrder
        );
    }

    async getTicketById(id: string) {
        const ticket = await ticketRepository.findById(id);
        if (!ticket) {
            throw new Error('Ticket not found');
        }
        return ticket;
    }

    async createTicket(ticketData: Partial<ITicket>) {
        return ticketRepository.create(ticketData);
    }

    async updateTicket(id: string, ticketData: Partial<ITicket>) {
        const updatedTicket = await ticketRepository.update(id, ticketData);
        if (!updatedTicket) {
            throw new Error('Ticket not found or could not be updated');
        }
        return updatedTicket;
    }

    async deleteTicket(id: string) {
        const deletedTicket = await ticketRepository.softDelete(id);
        if (!deletedTicket) {
            throw new Error('Ticket not found or could not be deleted');
        }
        return deletedTicket;
    }
}

export const ticketService = new TicketService();
