
import { Download } from '@/lib/backend/types';
import React from 'react';
import DownloadCard from './download-card';

interface DownloadViewerProps {
    recruitmentListId: string
    downloadInfos: Array<Download>;
}

const DownloadViewer: React.FC<DownloadViewerProps> = (props) => {

    const sortedDownloads = props.downloadInfos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <ul className='space-y-4'>
            {props.downloadInfos.length === 0 && (
                <li className='flex justify-center text-sm text-muted-foreground'>No downloads yet.</li>
            )}
            {sortedDownloads.map(download => (
                <li key={download.id}>
                    <DownloadCard
                        download={download}
                        recruitmentListId={props.recruitmentListId}
                    />
                </li>
            ))}
        </ul>

    );
};

export default DownloadViewer;
