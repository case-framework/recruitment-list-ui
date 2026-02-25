import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { auth } from '@/auth';

export async function createContext(opts?: FetchCreateContextFnOptions) {
  const session = await auth();

  return {
    token: session?.CASEaccessToken || null,
    userId: session?.user?.id || null,
    userName: session?.user?.name || null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
