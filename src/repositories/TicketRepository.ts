import Ticket, { ITicket, TicketStatus } from '@/models/Ticket';
import dbConnect from '@/lib/mongodb';

export class TicketRepository {
    async findAll(
        page: number = 1,
        limit: number = 10,
        search?: string,
        status?: string,
        sortField: string = 'createdAt',
        sortOrder: 'asc' | 'desc' = 'desc'
    ) {
        await dbConnect();
        const query: any = { isDeleted: false };

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        if (status) {
            query.status = status;
        }

        const tickets = await Ticket.find(query)
            .sort({ [sortField]: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Ticket.countDocuments(query);

        return {
            tickets,
            total,
            page,
            pages: Math.ceil(total / limit),
        };
    }

    async findById(id: string): Promise<ITicket | null> {
        await dbConnect();
        return Ticket.findOne({ _id: id, isDeleted: false });
    }

    async create(ticketData: Partial<ITicket>): Promise<ITicket> {
        await dbConnect();
        return Ticket.create(ticketData);
    }

    async update(id: string, ticketData: Partial<ITicket>): Promise<ITicket | null> {
        await dbConnect();
        return Ticket.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { $set: ticketData },
            { new: true }
        );
    }

    async softDelete(id: string): Promise<ITicket | null> {
        await dbConnect();
        return Ticket.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { $set: { isDeleted: true } },
            { new: true }
        );
    }
}

export const ticketRepository = new TicketRepository();
