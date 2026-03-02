'use client';

import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';

export const useMyRecruitmentLists = () => {
    const trpc = useTRPC();

    return useQuery(trpc.recruitmentListManagement.getMyRecruitmentLists.queryOptions());
};
