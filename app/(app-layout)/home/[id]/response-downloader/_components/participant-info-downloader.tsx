'use client'

import LoadingButton from '@/components/loading-button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { startParticipantInfoDownload } from '@/lib/backend/downloads';
import React from 'react';
import { toast } from 'sonner';

interface ParticipantInfoDownloaderProps {
    recruitmentListId: string;
}

const ParticipantInfoDownloader: React.FC<ParticipantInfoDownloaderProps> = (props) => {
    const [isPending, startTransition] = React.useTransition()
    const [selectedFormat, setSelectedFormat] = React.useState('csv');

    const onStartDownload = async () => {
        startTransition(async () => {
            const resp = await startParticipantInfoDownload(props.recruitmentListId, selectedFormat);
            if (resp.error !== undefined) {
                console.error(resp.error);
                toast.error('Could not start download', {
                    description: resp.error,
                });
                return;
            }
            toast.success('File preparation started');
        })
    }

    return (
        <div className='space-y-4 mt-4'>
            <div className='space-y-1.5'>
                <Label
                    className='text-sm font-medium'
                    htmlFor="format"
                >
                    Format
                </Label>
                <Select
                    name='format'
                    value={selectedFormat}
                    onValueChange={setSelectedFormat}
                    disabled={isPending}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select survey key" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <LoadingButton
                isLoading={isPending}
                onClick={onStartDownload}
            >
                Prepare download
            </LoadingButton>
        </div>
    );
};

export default ParticipantInfoDownloader;
