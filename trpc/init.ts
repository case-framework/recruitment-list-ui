import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { type Context } from './context'
import { TRPCErrorCodes } from './utils'


const t = initTRPC.context<Context>().create({
  transformer: superjson,
});


export const router = t.router;
export const procedure = t.procedure;

const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.token) {
    throw new TRPCError({ code: TRPCErrorCodes.UNAUTHORIZED })
  }
  return next({
    ctx: {
      ...ctx,
      token: ctx.token,
    },
  })
})


export const protectedProcedure = procedure.use(isAuthed)