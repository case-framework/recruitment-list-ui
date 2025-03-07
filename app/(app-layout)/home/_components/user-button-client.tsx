'use client'

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LogOut, UserRound } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { User } from 'next-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LoadingButton from '@/components/loading-button';
import { logout } from '@/actions/auth/logout';
import { Separator } from '@/components/ui/separator';
import { usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface UserButtonClientProps {
    user?: User;
    expires?: number;
}

const buttonProps = {
    label: 'Account',
}

const UserButtonClient: React.FC<UserButtonClientProps> = (props) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isPending, startTransition] = React.useTransition();
    const [remainingTime, setRemainingTime] = useState<string | null>(null);

    const pathname = usePathname();

    useEffect(() => {
        if (props.expires !== null && props.expires !== undefined) {
            const expirationTime = props.expires;
            const interval = setInterval(async () => {
                if (!expirationTime) return;

                const now = (new Date()).getTime() / 1000;
                const timeDifference = expirationTime - now;
                if (timeDifference > 0) {
                    const hours = Math.floor((timeDifference % (60 * 60 * 24)) / (60 * 60));
                    const minutes = Math.floor((timeDifference % (60 * 60)) / 60);
                    const seconds = Math.floor((timeDifference % 60));
                    setRemainingTime(`${hours}h ${minutes}m ${seconds}s`);
                } else {
                    setRemainingTime('Session expired');
                    const redirectTo = `/auth/login?redirectTo=${pathname}&auto-login=false`;
                    await logout(redirectTo);
                    clearInterval(interval);
                }
            }, 1000);
            return () => clearInterval(interval);
        } else {
            const redirectTo = `/auth/login?redirectTo=${pathname}&auto-login=false`;
            logout(redirectTo);
        }
    }, [props.expires, pathname]);

    return (

        <Popover open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
            <PopoverTrigger asChild>

                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg group"
                    aria-label={buttonProps.label}
                >
                    <Avatar className='size-8'>
                        <AvatarImage src={props.user?.image || ""} />
                        <AvatarFallback className='border border-border group-hover:bg-transparent'>
                            <UserRound className="size-5" />
                        </AvatarFallback>
                    </Avatar>
                </Button>

            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 space-y-4" align="end" side="right">
                <div className='space-y-4'>
                    <div className='w-full flex justify-center'>

                        <Avatar className='size-12'>
                            <AvatarImage src={props.user?.image || ""} />
                            <AvatarFallback className='border border-border group-hover:bg-transparent'>
                                <UserRound className="size-8" />
                            </AvatarFallback>
                        </Avatar>

                    </div>
                    <p className='max-w-80 truncate text-center'>
                        {props.user?.email}
                    </p>

                    <div className='space-y-2'>
                        <p className='text-end text-xs text-muted-foreground' >
                            Session expires in:
                        </p>
                        {remainingTime && (<p className='text-end text-xs'>
                            {remainingTime}
                        </p>)}
                        {!remainingTime && <div className='flex justify-end'><Skeleton className='h-4 w-20' /></div>}
                    </div>
                </div>
                <Separator />
                <LoadingButton
                    isLoading={isPending}
                    variant="outline" className="w-full" onClick={() => {
                        startTransition(async () => {
                            await logout('/')
                        })
                    }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </LoadingButton>
            </PopoverContent>
        </Popover>
    );
};

export default UserButtonClient;
