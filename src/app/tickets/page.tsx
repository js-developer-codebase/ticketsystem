'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';

const fetchTickets = async ({ pageParam = 1, queryKey }: any) => {
    const [_key, { search, status, sortOrder }] = queryKey;
    const params = new URLSearchParams({
        page: pageParam.toString(),
        limit: '10',
        search: search || '',
        status: status || '',
        sortOrder: sortOrder || 'desc',
        sortField: 'createdAt',
    });

    const response = await fetch(`/api/tickets?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch tickets');
    return response.json();
};

export default function TicketsPage() {
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const debouncedSearch = useDebounce(search, 500);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status: queryStatus,
        refetch,
        error,
    } = useInfiniteQuery({
        queryKey: ['tickets', { search: debouncedSearch, status: status === 'all' ? '' : status, sortOrder }],
        queryFn: fetchTickets,
        initialPageParam: 1,
        getNextPageParam: (lastPage) => (lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined),
    });

    // Infinite Scroll Detection with Framer Motion
    const { scrollYProgress } = useScroll();
    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        if (latest > 0.9 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    });

    const tickets = data?.pages.flatMap((page) => page.tickets) || [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-500 text-white';
            case 'inprogress': return 'bg-yellow-500 text-white';
            case 'resolved': return 'bg-green-500 text-white';
            default: return 'bg-slate-500 text-white';
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

    const getPriorityLabel = (priority: number) => {
        switch (priority) {
            case 1: return 'Low';
            case 2: return 'Medium';
            case 3: return 'High';
            case 4: return 'Urgent';
            case 5: return 'Critical';
            default: return 'Unknown';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex flex-col md:flex-row justify-between items-center mb-0 gap-4">
                <div>
                    <h1 className="text-lg font-semibold">Support Tickets</h1>
                    <p className="text-sm text-slate-500">{tickets?.length} Tickets</p>
                </div>
                <Link href="/tickets/new">
                    <Button><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                        Create Ticket</Button>
                </Link>
            </div>

            <div className="mb-8">
                <div className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
                        <div className="col-span-6">
                            <Input
                                startIcon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>}
                                placeholder="Search by title..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="col-span-4 grid grid-cols-2 gap-2 justify-end">
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                                    </svg>
                                    <SelectValue placeholder="" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="inprogress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Sort order" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="desc">Newest First</SelectItem>
                                    <SelectItem value="asc">Oldest First</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {queryStatus === 'pending' ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                </div>
            ) : queryStatus === 'error' ? (
                <div className="text-center py-10">
                    <p className="text-red-500 mb-4">Error loading tickets: {(error as Error).message}</p>
                    <Button onClick={() => refetch()}>Retry</Button>
                </div>
            ) : tickets.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-slate-500 mb-4">No tickets found</p>
                    <Button variant="outline" onClick={() => { setSearch(''); setStatus('all'); }}>
                        Clear Filters
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {tickets.map((ticket, index) => (
                        <motion.div
                            key={ticket._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index % 10 * 0.05 }}
                        >
                            <Link href={`/tickets/${ticket._id}`}>
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardHeader className="flex flex-row justify-between items-start pb-2">
                                        <div>
                                            <CardTitle className="text-xl font-semibold mb-1">{ticket.title}</CardTitle>
                                            <p className="text-sm text-slate-500 line-clamp-1">{ticket.description}</p>
                                        </div>
                                        <Badge className={getStatusColor(ticket.status)}>
                                            {ticket.status}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center text-sm text-slate-500">
                                            <div className="flex gap-4">
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
                                                    <span> {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}

                    {isFetchingNextPage && (
                        <div className="flex justify-center p-4">
                            <Skeleton className="h-8 w-8 rounded-full border-t-2 border-blue-600 animate-spin" />
                        </div>
                    )}

                    {!hasNextPage && tickets.length > 0 && (
                        <p className="text-center text-slate-500 mt-8 py-4 bg-slate-100 rounded-lg">
                            No more tickets available
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
