import { router, procedure } from '../init';
import { recruitmentListManagementRouter } from './recruitment-list-management';



export const appRouter = router({
  recruitmentListManagement: recruitmentListManagementRouter,

  // Example health check
  health: procedure.query(async () => {
    return { status: 'ok', timestamp: new Date() };
  }),
});

export type AppRouter = typeof appRouter;
