'use client'

import LoadingButton from '@/components/loading-button';
import { Card } from '@/components/ui/card';
import { Download } from '@/lib/backend/types';
import { format } from 'date-fns';
import { DownloadIcon, Loader2, Trash2 } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { deleteDownload, getDownloadStatus } from '@/lib/backend/downloads';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { cn } from '@/lib/utils';


interface DownloadCardProps {
    download: Download
    recruitmentListId: string
}

const DownloadCard: React.FC<DownloadCardProps> = (props) => {
    const [ispreparing, startTransition] = React.useTransition();
    const [isMounted, setIsMounted] = React.useState(false);
    const [confirmationOpen, setConfirmationOpen] = React.useState(false);
    const [currentStatus, setCurrentStatus] = React.useState(props.download.status);


    React.useEffect(() => {
        setIsMounted(true);
        return () => {
            setIsMounted(false);
        }
    }, []);

    React.useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        const checkStatus = async () => {
            try {
                const response = await getDownloadStatus(props.recruitmentListId, props.download.id);
                if (response.error !== undefined) {
                    console.error(response.error);
                    return;
                }
                const isNowAvailable = response.status !== 'preparing';

                setCurrentStatus(response.status);
                if (intervalId) {
                    if (isNowAvailable) {
                        clearInterval(intervalId);
                    }
                }
            } catch (error) {
                console.error('Error checking status:', error);
            }
        };

        if (currentStatus === 'preparing') {
            intervalId = setInterval(checkStatus, 1000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [currentStatus, props.download.id, props.recruitmentListId])


    if (!isMounted) {
        return null;
    }

    const onDownloadResult = () => {
        startTransition(async () => {
            try {
                const resp = await fetch(`/api/file-download/${props.recruitmentListId}/${props.download.id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (resp.status !== 200) {
                    toast.error('Failed to download file', {
                        description: resp.statusText
                    });
                    return;
                }
                const blob = await resp.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const filename = resp.headers.get('Content-Disposition')?.split('filename=')[1] || 'exported-participants.json';
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                toast.success('File downloaded');
            } catch (e) {
                console.error(e);
                toast.error('Failed to download file');
            }
        });
    }

    const onDeleteDownload = async () => {
        startTransition(async () => {
            setConfirmationOpen(false);
            const resp = await deleteDownload(props.recruitmentListId, props.download.id);
            if (resp.error !== undefined) {
                console.error(resp.error);
                toast.error('Could not delete download', {
                    description: resp.error,
                });
                return;
            }
            toast.success('Download deleted');
        })
    }

    const createdAt = format(new Date(props.download.createdAt), 'dd.MMM.yyyy HH:mm');

    return (
        <Card className="px-4 py-2 space-y-1" >
            <div className='flex items-center justify-end'>
                <span className='text-sm font-semibold'>{createdAt}</span>
            </div>
            <div className=''>
                <span className='text-xs font-medium mr-2'>
                    Filename:
                </span>
                <span className='text-sm font-medium font-mono'>
                    {props.download.fileName}
                </span>
            </div>
            <p className=''>
                <span className='text-xs font-medium mr-2'>
                    Content:
                </span>
                <span className='text-sm'>{props.download.filterInfo}</span>

            </p>
            <div className='flex justify-between items-center gap-4'>
                <div className={cn('flex gap-2 w-fit h-fit items-center rounded-full border border-border px-3 py-1 text-xs',
                    {
                        'bg-primary text-primary-foreground': currentStatus === 'preparing',
                        'bg-destructive text-destructive-foreground': currentStatus === 'failed',
                        'bg-secondary text-secondary-foreground': currentStatus === 'available',
                    }
                )}>
                    {currentStatus === 'preparing' && (<Loader2 className='animate-spin h-4 w-4' />)}
                    {currentStatus}
                </div>
                <div className='flex gap-4'>
                    <LoadingButton
                        variant={'outline'}
                        isLoading={ispreparing}
                        onClick={onDownloadResult}
                    >
                        <span>
                            <DownloadIcon className="mr-2 h-4 w-4" />
                        </span>
                        Download

                    </LoadingButton>
                    <LoadingButton
                        variant={'outline'}
                        isLoading={ispreparing}
                        onClick={() => setConfirmationOpen(true)}
                    >
                        <span><Trash2 className="mr-2 h-4 w-4" /></span>
                        Delete
                    </LoadingButton>
                </div>
            </div>
            <ConfirmDialog
                isOpen={confirmationOpen}
                onClose={() => {
                    setConfirmationOpen(false);
                }}
                onConfirm={onDeleteDownload}
                title="Confirm deletion"
                description="Are you sure you want to delete this download?"
                confirmText='Yes, delete'
                cancelText='Cancel'
            />
        </Card>
    );
};

export default DownloadCard;
