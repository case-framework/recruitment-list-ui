'use client';

import React from 'react';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from 'lucide-react';

const BackButton: React.FC = () => {
    const router = useRouter();

    return (
        <Button
            variant='ghost'
            onClick={() => router.back()}
        >
            <ArrowLeftIcon className='h-4 w-4' />
        </Button>
    );
};

export default BackButton;
