import { auth } from '@/auth';

export async function createContext() {
  const session = await auth();

  return {
    token: session?.CASEaccessToken || null,
    userId: session?.user?.id || null,
    userName: session?.user?.name || null,
    isAdmin: session?.isAdmin ?? false,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
