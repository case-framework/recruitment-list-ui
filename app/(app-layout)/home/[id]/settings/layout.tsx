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
    params: {
        id: string;
    }
}) {
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
        const hasManagementAccess = currentPermissions.some((permission: Permission) => permission.resourceId === params.id && permission.action === 'manage_recruitment_list');
        hasDeleteAccess = currentPermissions.some((permission: Permission) => permission.resourceId === params.id && permission.action === 'delete_recruitment_list');
        if (!hasManagementAccess && !hasDeleteAccess) {
            redirect('/home');
        }
    }


    return (
        <div className="h-full flex flex-col">

            <div className="flex grow">
                <SettingsNav
                    hasDeleteAccess={session.isAdmin || hasDeleteAccess}
                />
                <div
                    className="py-5 px-8 w-full"
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
