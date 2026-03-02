'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';

interface UseUsersFilter {
    query?: string;
}

const normalizeQuery = (query: string | undefined) => query?.trim().toLowerCase() ?? '';

export const useUsers = (filters?: UseUsersFilter) => {
    const trpc = useTRPC();
    const usersQuery = useQuery(trpc.userManagement.getUsers.queryOptions());

    const normalizedQuery = normalizeQuery(filters?.query);
    const users = useMemo(() => {
        const allUsers = usersQuery.data?.users ?? [];
        if (normalizedQuery.length === 0) {
            return allUsers;
        }

        return allUsers.filter((user) => {
            const usernameMatches = user.username.toLowerCase().includes(normalizedQuery);
            const emailMatches = user.email.toLowerCase().includes(normalizedQuery);
            const resourceMatches = user.resourceNames.some((resourceName) =>
                resourceName.toLowerCase().includes(normalizedQuery)
            );

            return usernameMatches || emailMatches || resourceMatches;
        });
    }, [normalizedQuery, usersQuery.data?.users]);

    return {
        ...usersQuery,
        users,
        totalUsers: usersQuery.data?.users.length ?? 0,
        filteredUsers: users.length,
    };
};
