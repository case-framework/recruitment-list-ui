'use client'

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Import } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import InviteCard from './invite-card';

interface ParticipantInviterProps {
    recruitmentListId: string;
}

const ParticipantInviter: React.FC<ParticipantInviterProps> = (props) => {
    const [inputValue, setInputValue] = React.useState('');

    const [idsToImport, setIdsToImport] = React.useState<string[]>([]);

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold">Import Participants</h2>
            <p className='text-sm text-muted-foreground'>
                You can import participants to this recruitment list manually using the following form. Participants can be imported only once per recruitment list.
            </p>

            <div className="space-y-1.5">
                <Label htmlFor="rl-name"
                    className="text-sm font-medium"
                >
                    Participant IDs
                </Label>
                <Textarea
                    id="rl-name"
                    placeholder="Participant IDs to be imported, one per line"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    autoComplete="off"
                    rows={10}
                />
            </div>
            <Button
                onClick={() => {
                    const lines = inputValue.split('\n');
                    const ids = lines.filter(line => line.trim() !== '').map(line => line.trim())
                    const onlyNewIds = ids.filter(id => !idsToImport.includes(id));
                    setIdsToImport(prev => [...onlyNewIds, ...prev]);
                    setInputValue('');
                    if (onlyNewIds.length === 0) {
                        toast.success('No new participants to import');
                        return;
                    }
                    toast.success('Import task started');
                }}
            >
                <Import className="mr-2 h-4 w-4" />
                Import
            </Button>

            <Separator />

            <h3 className='font-bold'>Import results:</h3>
            <div className='space-y-2'>
                {idsToImport.length === 0 && (
                    <div className='text-sm text-muted-foreground'>
                        Use the form above to import participants.
                    </div>
                )}
                {idsToImport.map((id) => (
                    <InviteCard id={id} key={id}
                        recruitmentListId={props.recruitmentListId}
                    />
                ))}
            </div>

        </div>
    );
};

export default ParticipantInviter;
