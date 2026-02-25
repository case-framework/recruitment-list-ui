import { protectedProcedure, router } from '../init';

export const recruitmentListManagementRouter = router({
    getAvailableTags: protectedProcedure.query(async ({ ctx }) => {
        const tags = ['tag1', 'tag2', 'tag3'];
        return tags;
    }),
});