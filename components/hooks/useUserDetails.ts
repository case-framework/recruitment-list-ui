'use client';

import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';

export const useUserDetails = (userId: string | null | undefined) => {
    const trpc = useTRPC();

    return useQuery({
        ...trpc.userManagement.getUserDetails.queryOptions({
            userId: userId ?? '',
        }),
        enabled: Boolean(userId),
    });
};
