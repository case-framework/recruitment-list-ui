'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';

export const useCreateRecruitmentList = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation(
        trpc.recruitmentListManagement.createPlaceholderRecruitmentList.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries(
                    trpc.recruitmentListManagement.getMyRecruitmentLists.queryFilter()
                );
            },
        })
    );
};
