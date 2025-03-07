'use client'

import LoadingButton from '@/components/loading-button';
import { ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useTransition } from 'react';
import { signIn } from 'next-auth/react';

const LoginClient: React.FC = () => {
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();


    const redirectToURL = searchParams.get('redirectTo') || '/';
    const autoLoginOff = searchParams.get('auto-login') === 'false';


    const performLogin = (redirectTo?: string) => {
        startTransition(async () => {

            let newURL = redirectTo ? decodeURIComponent(redirectTo) : '/';

            if (newURL.startsWith('http')) {
                newURL = '/';
            }
            await signIn('oidc-provider', { redirectTo: newURL });
        })
    }

    useEffect(() => {
        if (autoLoginOff) return;
        performLogin(redirectToURL);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [redirectToURL, autoLoginOff])

    return (
        <LoadingButton
            isLoading={isPending}
            onClick={() => performLogin(redirectToURL)}
            className='text-lg w-full'
            variant='default'
        >
            <ShieldCheck className='size-6' />
            Log in with Your Institution
        </LoadingButton>
    );
};

export default LoginClient;
