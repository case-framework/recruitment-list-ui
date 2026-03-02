import { router, procedure } from '../init';
import { recruitmentListManagementRouter } from './recruitment-list-management';
import { userManagementRouter } from './user-management';



export const appRouter = router({
  recruitmentListManagement: recruitmentListManagementRouter,
  userManagement: userManagementRouter,

  // Example health check
  health: procedure.query(async () => {
    return { status: 'ok', timestamp: new Date() };
  }),
});

export type AppRouter = typeof appRouter;
