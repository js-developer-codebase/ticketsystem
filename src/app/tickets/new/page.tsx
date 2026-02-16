'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const ticketSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(80, 'Title max 80 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    status: z.string().min(1, 'Status is required'),
    priority: z.coerce.number().min(1).max(5),
    assignee: z.string().min(2, 'Assignee must be at least 2 characters').optional().or(z.literal('')),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

export default function NewTicketPage() {
    const { token } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<TicketFormValues>({
        resolver: zodResolver(ticketSchema) as any,
        defaultValues: {
            status: 'open',
            priority: 2,
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: TicketFormValues) => {
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create ticket');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            toast.success('Ticket created successfully');
            router.push('/tickets');
        },
        onError: (error: any) => {
            toast.error(error.message);
        },
    });

    const onSubmit = (data: any) => {
        mutation.mutate(data);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" className="text-lg cursor-pointer" onClick={() => router.push('/tickets')}>
                    &larr;  Create New Ticket
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Create New Ticket</CardTitle>
                    <p className="text-sm text-slate-500">Provide the details for the new support ticket</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                placeholder="Enter ticket title"
                                {...register('title')}
                                className={errors.title ? 'border-red-500' : ''}
                            />
                            <p className="text-sm text-slate-500">Provide a clear and concise title (5-80 characters)</p>
                            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                placeholder="Describe the issue in detail"
                                rows={5}
                                {...register('description')}
                                className={errors.description ? 'border-red-500' : ''}
                            />
                            <p className="text-sm text-slate-500">Provide a detailed information about the issue (min 20 characters)</p>
                            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select
                                    defaultValue="open"
                                    onValueChange={(value) => setValue('status', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select status" />
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
                                    defaultValue="2"
                                    onValueChange={(value) => setValue('priority', parseInt(value))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4, 5].map((p) => (
                                            <SelectItem key={p} value={p.toString()}>
                                                {p}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Assignee (Optional)</label>
                            <Input
                                placeholder="Enter assignee name"
                                {...register('assignee')}
                                className={errors.assignee ? 'border-red-500' : ''}
                            />
                            <p className="text-sm text-slate-500">Leave empty if not assigned yet</p>
                            {errors.assignee && <p className="text-sm text-red-500">{errors.assignee.message}</p>}
                        </div>

                        <div className="flex gap-2 pt-4 justify-start">
                            <Button
                                type="submit"
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending ? 'Saving...' : 'Create Ticket'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
