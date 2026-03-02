import { auth } from "@/auth";
import SettingsNav from "./_components/settings-nav";
import { redirect } from "next/navigation";
import { getCurrentUserPermissions } from "@/lib/backend/permissions";
import { Permission } from "@/lib/backend/types";

export const dynamic = 'force-dynamic';

export default async function Layout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{
        id: string;
    }>
}) {
    const { id } = await params;
    const session = await auth();
    if (!session || !session.user) {
        redirect('/auth/login');
    }

    let hasDeleteAccess = false;
    if (!session.isAdmin) {
        const permissions = await getCurrentUserPermissions();
        if (permissions.error !== undefined) {
            redirect('/home');
        }

        const currentPermissions = permissions.permissions || [];
        const hasManagementAccess = currentPermissions.some((permission: Permission) => permission.resourceId === id && permission.action === 'manage_recruitment_list');
        hasDeleteAccess = currentPermissions.some((permission: Permission) => permission.resourceId === id && permission.action === 'delete_recruitment_list');
        if (!hasManagementAccess && !hasDeleteAccess) {
            redirect('/home');
        }
    }


    return (
        <div className="h-full min-h-0 overflow-hidden">
            <div className="flex h-full min-h-0 min-w-0">
                <SettingsNav
                    hasDeleteAccess={session.isAdmin || hasDeleteAccess}
                />
                <main className="min-w-0 flex-1 overflow-y-auto px-8 py-5">
                    <div className="mx-auto w-full max-w-[1200px] min-w-0">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
