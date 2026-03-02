import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import UserManagementWorkspace from './_components/user-management-workspace';

export const dynamic = 'force-dynamic';

export default async function Page() {
    const session = await auth();
    if (!session || !session.user) {
        redirect('/auth/login');
    }

    if (!session.isAdmin) {
        redirect('/auth/admin-account-required');
    }

    return <UserManagementWorkspace currentUserSub={session.user.sub} />;
}
