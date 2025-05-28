'use client'

import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { executeStudyAction, updateParticipantStatus } from '@/lib/backend/participants';
import { Participant, StudyAction } from '@/lib/backend/types';
import { ChevronDownIcon, CopyIcon, InfoIcon, Loader2, PlayIcon } from 'lucide-react';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useCopyToClipboard } from 'usehooks-ts';

interface ParticipantInfosProps {
    participant: Participant
    infoKeys: string[]
    statusValues: string[]
    recruitmentListId: string
    studyActions: StudyAction[]
}

const ParticipantInfos: React.FC<ParticipantInfosProps> = (props) => {
    const [isPending, startTransition] = React.useTransition();
    const [mounted, setMounted] = React.useState(false);
    const [, copyToClipboard] = useCopyToClipboard();
    const [executingActionId, setExecutingActionId] = React.useState<string | null>(null);
    const [actionPopoverOpen, setActionPopoverOpen] = React.useState(false);

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

    const onExecuteAction = async (actionId: string) => {
        setExecutingActionId(actionId);
        try {
            const resp = await executeStudyAction(props.recruitmentListId, props.participant.id, actionId);
            if (resp.error !== undefined) {
                console.error(resp.error);
                toast.error('Could not execute study action', {
                    description: resp.error,
                });
                return;
            }
            toast.success('Study action executed successfully');
        } catch (error) {
            toast.error('Could not execute study action');
        } finally {
            setActionPopoverOpen(false);
            setExecutingActionId(null);
        }
    }

    return (
        <div className='p-4'>
            <div className='bg-neutral-50 -m-4 p-4'>
                <div>
                    <p className='font-medium text-sm mb-1.5'>Participant ID</p>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className='w-full cursor-pointer flex justify-between items-center gap-2 font-mono text-xs px-2 py-2 bg-background text-primary rounded-md overflow-x-auto border border-border hover:bg-neutral-50'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(props.participant.participantId);
                                    toast.success('Participant ID copied to clipboard');
                                }}
                            >
                                {props.participant.participantId}
                                <CopyIcon className='size-3 ' />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Copy participant ID</p>
                        </TooltipContent>
                    </Tooltip>
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

                {props.studyActions && props.studyActions.length > 0 && (
                    <div className='flex justify-between gap-2 items-center my-4'>
                        <p className='font-medium text-sm w-fit shrink-0'>Study Actions:</p>
                        <Popover
                            open={actionPopoverOpen}
                            onOpenChange={setActionPopoverOpen}
                        >
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="min-w-64 w-fit relative flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                                >
                                    <span className="text-center text-sm grow font-normal">
                                        Available Study Actions
                                    </span>
                                    <ChevronDownIcon className="size-4 ml-2 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-80">
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm mb-3">Available Study Actions</h4>
                                    {props.studyActions.map(action => (
                                        <Button
                                            key={action.id}
                                            variant="outline"
                                            className="w-full justify-start"
                                            disabled={executingActionId !== null}
                                            onClick={() => onExecuteAction(action.id)}
                                        >
                                            {executingActionId === action.id ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <PlayIcon className="h-4 w-4 mr-2 opacity-50" />
                                            )}
                                            <>
                                                <span className="text-start text-sm grow font-normal">
                                                    {action.label}
                                                </span>
                                                <Tooltip delayDuration={200}>
                                                    <TooltipTrigger asChild>
                                                        <span>
                                                            <InfoIcon className="size-4 ml-2 opacity-50" />
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <pre className='text-xs whitespace-pre-wrap'>{action.description}</pre>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </>
                                        </Button>

                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                )}
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
