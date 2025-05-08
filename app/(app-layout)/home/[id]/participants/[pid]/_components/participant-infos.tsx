'use client'

import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { updateParticipantStatus } from '@/lib/backend/participants';
import { Participant } from '@/lib/backend/types';
import { Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { toast } from 'sonner';

interface ParticipantInfosProps {
    participant: Participant
    infoKeys: string[]
    statusValues: string[]
    recruitmentListId: string
}

const ParticipantInfos: React.FC<ParticipantInfosProps> = (props) => {
    const [isPending, startTransition] = React.useTransition();
    const [mounted, setMounted] = React.useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const onUpdateStatus = async (status: string) => {
        startTransition(async () => {
            if (!props.participant.participantId) {
                return;
            }
            const resp = await updateParticipantStatus(props.recruitmentListId, props.participant.id, status);
            if (resp.error !== undefined) {
                console.error(resp.error);
                toast.error('Could not update participant status', {
                    description: resp.error,
                });
                return;
            }
            toast.success('Participant status updated');
        })
    }

    return (
        <div className='p-4'>
            <div className='bg-neutral-50 -m-4 p-4'>
                <div>
                    <p className='font-medium text-sm mb-1.5'>Participant ID</p>
                    <div className='font-mono text-xs px-2 py-2 bg-background text-primary rounded-md overflow-x-auto border border-border'>
                        {props.participant.participantId}
                    </div>
                </div>

                <div className='my-4'>
                    <p className='font-medium text-sm mb-1.5'>Imported at</p>
                    <div className='font-mono text-xs px-2 py-2 bg-background text-primary rounded-md overflow-x-auto border border-border'>
                        {mounted && new Date(props.participant.includedAt).toLocaleString()}
                    </div>
                </div>

                <div className='flex justify-between gap-2 items-center my-4'>
                    <p className='font-medium text-sm w-fit shrink-0'>Recruitment Status:</p>
                    <Select
                        disabled={isPending}
                        onValueChange={onUpdateStatus}
                        defaultValue={props.participant.recruitmentStatus}
                    >
                        <SelectTrigger
                            className='min-w-64 w-fit'
                        >
                            {isPending && <span><Loader2 className='animate-spin h-4 w-4 mr-2' /></span>}
                            <span></span>
                            <SelectValue placeholder="Select recruitment status" />
                        </SelectTrigger>
                        <SelectContent>
                            {props.statusValues.map(status => (
                                <SelectItem
                                    key={status}
                                    value={status}>{status}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className='-mx-4 my-4'>
                <Separator />
            </div>
            <div className=''>
                <p className='font-semibold'>
                    Infos:
                </p>
                {props.participant.deletedAt !== undefined && (
                    <div className='flex justify-between gap-2 items-center py-1 px-4 border border-destructive rounded-full border-dashed mt-4'>
                        <p className='font-medium text-sm shrink-0'>Deleted at:</p>
                        <div className='font-mono text-xs px-2 py-2 bg-neutral-50 rounded-md overflow-x-auto'>
                            {props.participant.deletedAt}
                        </div>
                    </div>
                )}
                {
                    props.participant.infos && Object.keys(props.participant.infos).length > 0 &&
                    <div className='flex flex-col divide-y -mx-4'>
                        {props.infoKeys.map(key => (
                            <div key={key} className='flex justify-between gap-2 items-center py-1 hover:bg-neutral-50 px-4'>
                                <p className='font-medium text-sm shrink-0'>{key}:</p>
                                <div className='font-mono text-xs px-2 py-2 bg-neutral-50 rounded-md overflow-x-auto'>
                                    {props.participant.infos[key] || '-'}
                                </div>
                            </div>
                        ))}
                    </div>
                }
            </div>
        </div>
    );
};

export default ParticipantInfos;
