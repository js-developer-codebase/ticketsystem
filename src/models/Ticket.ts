import mongoose, { Schema, Document } from 'mongoose';

export enum TicketStatus {
    OPEN = 'open',
    IN_PROGRESS = 'inprogress',
    RESOLVED = 'resolved',
}

export enum TicketPriority {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
    URGENT = 4,
    CRITICAL = 5,
}

export interface ITicket extends Document {
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    assignee?: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TicketSchema: Schema = new Schema(
    {
        title: { type: String, required: true, minLength: 5, maxLength: 80 },
        description: { type: String, required: true, minLength: 20 },
        status: {
            type: String,
            enum: Object.values(TicketStatus),
            default: TicketStatus.OPEN,
        },
        priority: {
            type: Number,
            enum: [1, 2, 3, 4, 5],
            default: TicketPriority.MEDIUM,
        },
        assignee: { type: String },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);
