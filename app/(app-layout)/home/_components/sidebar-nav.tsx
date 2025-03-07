'use client'

import { useParams } from 'next/navigation';
import React from 'react';
import SideBarButton from './sidebar-button';
import { Download, Users } from 'lucide-react';

const SidebarNav: React.FC = () => {
    const params = useParams();

    return (
        <nav className="grid gap-1 p-2">
            <SideBarButton
                icon={<Users className="size-5" />}
                label="Participants overview"
                disabled={params.id === undefined}
                href={`/home/${params.id}/participants`}
            />

            <SideBarButton
                icon={<Download className="size-5" />}
                label="Response downloader"
                disabled={params.id === undefined}
                href={`/home/${params.id}/response-downloader`}
            />

        </nav>
    );
};

export default SidebarNav;
