import { auth } from '@/auth';
import React from 'react';
import LogoutTrigger from './logout-trigger';
import UserButtonClient from './user-button-client';

const UserButton: React.FC = async () => {
    const session = await auth();

    if (!session || !session?.user?.email) {
        return <LogoutTrigger />
    }


    return (
        <UserButtonClient
            user={session.user}
            expires={session.tokenExpiresAt}
        />
    );
};

export default UserButton;
