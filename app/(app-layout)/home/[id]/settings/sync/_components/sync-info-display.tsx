'use client'

import { ConfirmDialog } from '@/components/confirm-dialog';
import LoadingButton from '@/components/loading-button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getSyncInfos, resetDataSyncTimeNull, resetParticipantSyncTimeNull, syncParticipantsNow, syncResponsesNow } from '@/lib/backend/recruitmentLists';
import { RefreshCw } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

interface SyncInfoDisplayProps {
    syncInfos: {
        id: string;
        recruitmentListId: string;
        participantSyncStatus: string;
        participantSyncStartedAt: string;
        dataSyncStatus: string;
        dataSyncStartedAt: string;
    }
}

const formatDate = (date: Date | null | undefined) => date ? date.toLocaleString() : 'Never'

const SyncInfoDisplay: React.FC<SyncInfoDisplayProps> = (props) => {
    const [isPending, startTransition] = React.useTransition();
    const [isRefreshPending, startRefreshTransition] = React.useTransition();
    const [confirmationToResetPSyncOpen, setConfirmationToResetPSyncOpen] = React.useState(false);
    const [confirmationToResetDSyncOpen, setConfirmationToResetDSyncOpen] = React.useState(false);

    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
        return () => {
            setIsMounted(false);
        }
    }, []);

    React.useEffect(() => {
        if (props.syncInfos.dataSyncStatus === 'running' || props.syncInfos.participantSyncStatus === 'running') {
            const interval = setInterval(() => {
                onRefresh();
            }, 2000);
            return () => {
                clearInterval(interval);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.syncInfos.dataSyncStatus, props.syncInfos.participantSyncStatus]);

    const onRefresh = () => {
        startRefreshTransition(async () => {
            if (!props.syncInfos.recruitmentListId) {
                return;
            }
            const resp = await getSyncInfos(props.syncInfos.recruitmentListId);
            if (resp.error !== undefined) {
                console.error(resp.error);
                toast.error('Could not refresh sync info', {
                    description: resp.error,
                });
                return;
            }
        })
    }

    if (!isMounted) {
        return null;
    }

    const onSyncParticipants = () => {
        startTransition(async () => {
            if (!props.syncInfos.recruitmentListId) {
                return;
            }
            const resp = await syncParticipantsNow(props.syncInfos.recruitmentListId);
            if (resp.error !== undefined) {
                console.error(resp.error);
                toast.error('Could not sync participants', {
                    description: resp.error,
                });
                return;
            }
            toast.success('Participant sync started');
            onRefresh();
        })
    }

    const onResetParticipantSync = () => {
        startTransition(async () => {
            if (!props.syncInfos.recruitmentListId) {
                return;
            }
            const resp = await resetParticipantSyncTimeNull(props.syncInfos.recruitmentListId);
            if (resp.error !== undefined) {
                console.error(resp.error);
                toast.error('Could not reset participant sync time', {
                    description: resp.error,
                });
                return;
            }
            toast.success('Participant sync time reset');
        })
    }

    const onResetResponsesSync = () => {
        startTransition(async () => {
            if (!props.syncInfos.recruitmentListId) {
                return;
            }
            const resp = await resetDataSyncTimeNull(props.syncInfos.recruitmentListId);
            if (resp.error !== undefined) {
                console.error(resp.error);
                toast.error('Could not reset data sync time', {
                    description: resp.error,
                });
                return;
            }
            toast.success('Data sync time reset');
        });
    }

    const onSyncResponses = () => {
        startTransition(async () => {
            if (!props.syncInfos.recruitmentListId) {
                return;
            }
            const resp = await syncResponsesNow(props.syncInfos.recruitmentListId);
            if (resp.error !== undefined) {
                console.error(resp.error);
                toast.error('Could not sync responses', {
                    description: resp.error,
                });
                return;
            }
            toast.success('Response sync started');
            onRefresh();
        })
    }

    const lastParticipantSync = props.syncInfos.participantSyncStartedAt ? new Date(props.syncInfos.participantSyncStartedAt) : null;
    const lastResponseSync = props.syncInfos.dataSyncStartedAt ? new Date(props.syncInfos.dataSyncStartedAt) : null;

    return (
        <div className="space-y-4 max-w-xl">
            <h2 className="text-lg font-bold">
                Data Synchronization Information
            </h2>

            <div className='space-y-4'>
                <div className='flex justify-end'>
                    <LoadingButton
                        variant={'outline'}
                        isLoading={isRefreshPending}
                        onClick={onRefresh}
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </LoadingButton>
                </div>
                <Card className="flex justify-between p-4">
                    <div>
                        <p className="font-semibold">Last Participant Sync:</p>
                        <p>{formatDate(lastParticipantSync)}</p>
                        <Badge variant={'secondary'}>
                            {props.syncInfos.participantSyncStatus || 'Idle'}
                        </Badge>
                    </div>
                    <div className="flex flex-col gap-2">
                        <LoadingButton
                            isLoading={isPending || props.syncInfos.participantSyncStatus === 'running'}
                            onClick={onSyncParticipants}>
                            Sync Now
                        </LoadingButton>
                    </div>
                </Card>
                <Card className="flex justify-between p-4">
                    <div>
                        <p className="font-semibold">Last Response Sync:</p>
                        <p>{formatDate(lastResponseSync)}</p>
                        <Badge variant={'secondary'}>
                            {props.syncInfos.dataSyncStatus || 'Idle'}
                        </Badge>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <LoadingButton
                            isLoading={isPending || props.syncInfos.dataSyncStatus === 'running'}
                            onClick={onSyncResponses}>
                            Sync Now
                        </LoadingButton>
                    </div>

                </Card>

                <Card className='p-4 border-dashed border-destructive'>
                    <p className="font-semibold">Danger zone</p>
                    <p className='text-sm '>Destructive actions, use with caution. Can be useful if you want to enforce resynchronisation, e.g., because columns should be excluded now, or inclusion criteria has changed.</p>
                    <div className='flex gap-4 mt-4'>
                        <LoadingButton
                            isLoading={isPending}
                            variant="outline" onClick={() => setConfirmationToResetPSyncOpen(true)}>
                            Clean all data
                        </LoadingButton>
                        <LoadingButton
                            isLoading={isPending}
                            variant="outline" onClick={() => setConfirmationToResetDSyncOpen(true)}>
                            Clean responses
                        </LoadingButton>
                    </div>
                </Card>
            </div>
            <ConfirmDialog
                title="Clean participants and responses"
                description="Are you sure you want to clean the participants and responses? This will remove all participants and responses from the recruitment list."
                onConfirm={() => {
                    onResetParticipantSync()
                    setConfirmationToResetPSyncOpen(false)
                }}
                isOpen={confirmationToResetPSyncOpen}
                onClose={() => setConfirmationToResetPSyncOpen(false)}
            />
            <ConfirmDialog
                title="Delete responses and reset sync time"
                description="Are you sure you want to reset the data sync time null? This will remove all already synced responses as well."
                onConfirm={() => {
                    onResetResponsesSync()
                    setConfirmationToResetDSyncOpen(false)
                }}
                isOpen={confirmationToResetDSyncOpen}
                onClose={() => setConfirmationToResetDSyncOpen(false)}
            />


        </div>
    );
};

export default SyncInfoDisplay;
