'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const editTicketSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(80, 'Title max 80 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    status: z.string().min(1, 'Status is required'),
    priority: z.coerce.number().min(1).max(5),
    assignee: z.string().min(2, 'Assignee must be at least 2 characters').optional().or(z.literal('')),
});

type EditTicketFormValues = z.infer<typeof editTicketSchema>;

export default function TicketDetailsPage() {
    const { id } = useParams();
    const { token, user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { data: ticket, isLoading, isError, error } = useQuery({
        queryKey: ['ticket', id],
        queryFn: async () => {
            const response = await fetch(`/api/tickets/${id}`);
            if (!response.ok) throw new Error('Failed to fetch ticket');
            return response.json();
        },
    });

    const editForm = useForm<EditTicketFormValues>({
        resolver: zodResolver(editTicketSchema) as any,
    });

    const updateMutation = useMutation({
        mutationFn: async (data: EditTicketFormValues) => {
            const response = await fetch(`/api/tickets/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update ticket');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket', id] });
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            toast.success('Ticket updated successfully');
            setIsEditModalOpen(false);
        },
        onError: (error: any) => {
            toast.error(error.message);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`/api/tickets/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error('Failed to delete ticket');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            toast.success('Ticket deleted successfully');
            router.push('/tickets');
        },
        onError: (error: any) => {
            toast.error(error.message);
        },
    });

    const onEditSubmit = (data: EditTicketFormValues) => {
        updateMutation.mutate(data);
    };

    const openEditModal = () => {
        if (ticket) {
            editForm.reset({
                title: ticket.title,
                description: ticket.description,
                status: ticket.status,
                priority: ticket.priority,
                assignee: ticket.assignee || '',
            });
            setIsEditModalOpen(true);
        }
    };

    if (isLoading) return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Skeleton className="h-10 w-48 mb-6" />
            <Skeleton className="h-64 w-full rounded-xl" />
        </div>
    );

    if (isError) return (
        <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-red-500 mb-4">Error loading ticket: {(error as Error).message}</p>
            <Button onClick={() => router.push('/tickets')}>Back to List</Button>
        </div>
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800';
            case 'inprogress': return 'bg-yellow-100 text-yellow-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 1: return 'bg-slate-100 text-slate-800';
            case 2: return 'bg-blue-100 text-blue-800';
            case 3: return 'bg-yellow-100 text-yellow-800';
            case 4: return 'bg-orange-100 text-orange-800';
            case 5: return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" className="text-lg cursor-pointer" onClick={() => router.push('/tickets')}>
                    &larr; Ticket Details
                </Button>
            </div>

            <Card className="p-5">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center mb-2">
                        <p className="text-lg font-bold">{ticket.title}</p>
                        <Badge className={`${getStatusColor(ticket.status)} text-sm px-2 py-0`}>
                            {ticket.status}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <span onClick={openEditModal} className="cursor-pointer hover:text-blue-600 transition-colors mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                        </span>
                        <span onClick={() => setIsDeleteModalOpen(true)} className="cursor-pointer hover:text-red-600 transition-colors text-red-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>

                        </span>
                    </div>
                </div>
                <div className="flex gap-4 text-sm text-slate-500">
                    <div className="flex justify-between items-center text-sm text-slate-500">
                        <div className="flex gap-4">
                            <div className="flex justify-between items-center text-sm text-slate-500">
                                <div>
                                    <span className="flex items-center gap-1">
                                        <span className={`flex items-center gap-1 text-${getPriorityColor(ticket.priority)}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                            </svg>
                                        </span>
                                        Priority: <b>{ticket.priority}</b>
                                    </span>
                                </div>
                            </div>

                            {ticket.assignee && <span className="flex items-center gap-1"> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                                {ticket.assignee}</span>}

                            <div className="flex items-center gap-1">
                                <span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                    </svg>
                                </span>
                                <span>Created {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}</span>
                            </div>
                        </div>

                    </div>
                </div>
                <div className="pt-2 space-y-8">
                    <div>
                        <h3 className="text-base font-semibold mb-3">Description</h3>
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {ticket.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                        <div>
                            <h3 className="text-sm font-medium text-slate-500 tracking-wider mb-1">Status</h3>
                            <p className="text-base font-medium">{ticket.status}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-slate-500 tracking-wider mb-1">Priority</h3>
                            <p className="text-base font-medium">Level {ticket.priority}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-slate-500 tracking-wider mb-1">Assignee</h3>
                            <p className="text-base font-medium">{ticket.assignee || 'Unassigned'}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-slate-500 tracking-wider mb-1">Last Updated</h3>
                            <p className="text-base font-medium">{format(new Date(ticket.updatedAt), 'MMM dd, yyyy')}</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Ticket</DialogTitle>
                        <p className="text-sm text-slate-500">Update the ticket details below</p>
                    </DialogHeader>
                    <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 pt-0">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                {...editForm.register('title')}
                                className={editForm.formState.errors.title ? 'border-red-500' : ''}
                            />
                            <p className="text-sm text-slate-500">Provide a clear and concise title (5-80 characters)</p>
                            {editForm.formState.errors.title && <p className="text-sm text-red-500">{editForm.formState.errors.title.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                rows={5}
                                {...editForm.register('description')}
                                className={editForm.formState.errors.description ? 'border-red-500' : ''}
                            />
                            <p className="text-sm text-slate-500">Provide a detailed information about the issue (min 20 characters)</p>
                            {editForm.formState.errors.description && <p className="text-sm text-red-500">{editForm.formState.errors.description.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select
                                    defaultValue={ticket.status}
                                    onValueChange={(v) => editForm.setValue('status', v)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="inprogress">In Progress</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Priority (1-5)</label>
                                <Select
                                    defaultValue={ticket.priority.toString()}
                                    onValueChange={(v) => editForm.setValue('priority', parseInt(v))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4, 5].map((p) => (
                                            <SelectItem key={p} value={p.toString()}>{p}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Assignee (Optional)</label>
                            <Input
                                {...editForm.register('assignee')}
                                className={editForm.formState.errors.assignee ? 'border-red-500' : ''}
                            />
                            <p className="text-sm text-slate-500">Leave empty if not assigned yet</p>
                            {editForm.formState.errors.assignee && <p className="text-sm text-red-500">{editForm.formState.errors.assignee.message}</p>}
                        </div>
                        <DialogFooter className="pt-4 justify-start">
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? 'Updating...' : 'Update Ticket'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Ticket</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this ticket?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="justify-end sm:justify-end">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
