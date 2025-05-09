'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getParticipants } from '@/lib/backend/participants';
import { Participant, ParticipantInfo } from '@/lib/backend/types';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import FilterEditor from './filter-editor';
import { Card } from '@/components/ui/card';
import SortEditor from './sort-editor';

interface ParticipantsViewProps {
    recruitmentListId: string
    participantInfos: ParticipantInfo[]
    participantsPage: {
        participants: Participant[]
        pagination: PaginationInfo
    }
    statusValues: string[]
}

interface PaginationInfo {
    currentPage: number
    totalPages: number
    totalCount: number
    pageSize: number
}

const ParticipantsView: React.FC<ParticipantsViewProps> = (props) => {
    const [participants, setParticipants] = useState<Participant[]>(props.participantsPage.participants || [])
    const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | undefined>(props.participantsPage.pagination);
    const [page, setPage] = useState(props.participantsPage.pagination.currentPage)
    const [loading, setLoading] = useState(false)
    const loader = useRef(null)
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const searchParams = useSearchParams();
    const [currentQuery, setCurrentQuery] = useState<string>(searchParams.toString());

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (currentQuery !== searchParams.toString()) {
            setPage(1);
            setCurrentQuery(searchParams.toString());
            setParticipants([]);
            setPaginationInfo(undefined);
            return;
        }
        if (paginationInfo === undefined || (paginationInfo.currentPage !== page && props.participantsPage.pagination.totalPages >= page)) {
            const fetchParticipants = async () => {
                const hasFilters = searchParams.get('participantId') ||
                    searchParams.get('recruitmentStatus') ||
                    searchParams.get('includedSince') ||
                    searchParams.get('includedUntil');
                const pFilters = hasFilters ? {
                    participantId: searchParams.get('participantId'),
                    recruitmentStatus: searchParams.get('recruitmentStatus'),
                    includedSince: searchParams.get('includedSince'),
                    includedUntil: searchParams.get('includedUntil'),
                } : undefined;
                setLoading(true)
                const resp = await getParticipants(props.recruitmentListId, page, pFilters, searchParams.get('sortBy') || undefined, searchParams.get('sortDir') || undefined);
                if (resp.error !== undefined) {
                    console.error(resp.error);
                    toast.error('Could not fetch participants', {
                        description: resp.error,
                    });
                    setLoading(false)
                    return;
                }
                const newParticipants = resp.participants || [];
                setParticipants(prev => [...prev, ...newParticipants]);
                setPaginationInfo(resp.pagination);
                setLoading(false)
            }
            fetchParticipants()
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, currentQuery, searchParams])

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !loading) {
                    setPage(prevPage => prevPage + 1)
                }
            },
            { threshold: 1.0 }
        )

        if (loader.current) {
            observer.observe(loader.current)
        }

        return () => observer.disconnect()
    }, [loading])


    const participantInfos = (props.participantInfos || []).filter(participantInfo => participantInfo.showInPreview)
    return (
        <>
            <div className='flex gap-4 justify-end'>
                <FilterEditor
                    statusValues={props.statusValues}
                />
                <SortEditor />
            </div>
            <Card>
                <div className="w-full overflow-auto z-10">

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Participant ID</TableHead>
                                <TableHead>Imported at</TableHead>
                                <TableHead>Status</TableHead>
                                {participantInfos.map(participantInfo => (
                                    <TableHead key={participantInfo.id}>{participantInfo.label}</TableHead>
                                ))}

                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {participants.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={participantInfos.length + 2} className="text-center text-muted-foreground">
                                        No participants yet.
                                    </TableCell>
                                </TableRow>
                            )}
                            {participants.map(participant => (
                                <TableRow key={participant.participantId}
                                    className='cursor-pointer'
                                    onClick={() => {
                                        router.push(`/home/${props.recruitmentListId}/participants/${participant.id}`);
                                    }}
                                >
                                    <TableCell>
                                        <span className='font-mono text-xs'>{participant.participantId}</span>
                                        {participant.deletedAt && <span className='text-xs text-destructive'> (deleted)</span>}
                                    </TableCell>
                                    <TableCell>{mounted && new Date(participant.includedAt).toLocaleString()}</TableCell>
                                    <TableCell>{participant.recruitmentStatus}</TableCell>
                                    {participantInfos.map(participantInfo => {
                                        let cellValue = '';
                                        if (participant.infos !== undefined && participant.infos[participantInfo.label] !== undefined) {
                                            cellValue = participant.infos[participantInfo.label];
                                        }
                                        return <TableCell key={participantInfo.id}>{cellValue}</TableCell>
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {loading && <div className='flex items-center justify-center py-4 text-primary'>
                        <Loader2 className='animate-spin size-4 mr-2' />
                        <span>Loading more participants...</span>
                    </div>}
                    <div ref={loader} />
                </div >
            </Card>
        </>
    );
};

export default ParticipantsView;
