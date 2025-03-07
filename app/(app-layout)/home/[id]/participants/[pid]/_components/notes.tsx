'use client'

import { ConfirmDialog } from '@/components/confirm-dialog';
import LoadingButton from '@/components/loading-button';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { createParticipantNote, deleteParticipantNote } from '@/lib/backend/participants';
import { ParticipantNote } from '@/lib/backend/types';
import { formatDistanceToNow } from 'date-fns';
import { PlusCircle, Trash2 } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

interface NotesProps {
    recruitmentListId: string
    pid: string
    notes: Array<{
        item: ParticipantNote
        allowedToDelete: boolean
    }>
}

const Notes: React.FC<NotesProps> = (props) => {
    const [isMounted, setIsMounted] = React.useState(false);
    const [isPending, startTransition] = React.useTransition();
    const [note, setNote] = React.useState('');
    const [popoverOpen, setPopoverOpen] = React.useState(false);
    const [noteToDelete, setNoteToDelete] = React.useState<string | undefined>(undefined);

    React.useEffect(() => {
        setIsMounted(true);
        return () => {
            setIsMounted(false);
        }
    }, []);

    if (!isMounted) {
        return null;
    }

    const onAddNote = async () => {
        startTransition(async () => {
            const resp = await createParticipantNote(props.recruitmentListId, props.pid, note);
            if (resp.error !== undefined) {
                console.error(resp.error);
                toast.error('Could not add note', {
                    description: resp.error,
                });
                return;
            }
            toast.success('Note added');
            setNote('');
            setPopoverOpen(false);
        })
    }

    const onDeleteNote = async () => {
        startTransition(async () => {
            if (!noteToDelete) {
                return;
            }
            const resp = await deleteParticipantNote(props.recruitmentListId, props.pid, noteToDelete);
            if (resp.error !== undefined) {
                console.error(resp.error);
                toast.error('Could not delete note', {
                    description: resp.error,
                });
                setNoteToDelete(undefined);
                return;
            }
            toast.success('Note deleted');
            setNoteToDelete(undefined);
        })
    }

    const sortedNotes = props.notes.sort((a, b) => new Date(b.item.createdAt).getTime() - new Date(a.item.createdAt).getTime());
    return (
        <div
            className='p-4 space-y-4'
        >
            <h3 className='font-bold'>Notes</h3>
            <div className='flex justify-center'>
                <Popover
                    open={popoverOpen}
                    onOpenChange={setPopoverOpen}
                >
                    <PopoverTrigger asChild>
                        <Button variant={'outline'}>
                            <span><PlusCircle className="mr-2 h-4 w-4" /></span>
                            <span>Add note</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96 space-y-4">
                        <Textarea
                            placeholder="Enter note"
                            rows={3}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                        <LoadingButton
                            variant={'default'}
                            className='w-full'
                            isLoading={isPending}
                            onClick={onAddNote}
                        >Save note</LoadingButton>
                    </PopoverContent>
                </Popover>
            </div>
            {props.notes.length === 0 && (
                <p className='text-muted-foreground text-center text-sm border border-dashed border-border p-4 rounded-md'>
                    There are no notes yet for this participant.
                </p>
            )}
            {sortedNotes.map(note => (
                <div key={note.item.id}
                    className='relative group'>

                    <pre className='px-4 py-3 bg-secondary/30 border border-border  rounded-md overflow-x-auto text-wrap font-sans'>
                        <p className='text-xs flex justify-between text-neutral-700'>
                            {formatDistanceToNow(new Date(note.item.createdAt))} ago
                            <span className='ml-auto'>
                                {note.item.createdBy}
                            </span>
                        </p>
                        <Separator className='my-2' />
                        {note.item.note}
                    </pre>
                    {note.allowedToDelete && (
                        <div className='absolute hidden group-hover:block right-1 bottom-1'>
                            <Button
                                variant={'ghost'}
                                size={'icon'}
                                disabled={isPending}
                                onClick={() => {
                                    setNoteToDelete(note.item.id);
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            ))}

            <ConfirmDialog
                isOpen={noteToDelete !== undefined}
                onClose={() => {
                    setNoteToDelete(undefined);
                }}
                onConfirm={() => {
                    onDeleteNote()
                }}
                title="Confirm deletion"
                description="Are you sure you want to delete this note?"
                confirmText='Yes, delete'
                cancelText='Cancel'
            />

        </div>
    );
};

export default Notes;
