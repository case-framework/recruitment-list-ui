import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { getCurrentUserPermissions } from "@/lib/backend/permissions";
import { getRecruitmentList } from "@/lib/backend/recruitmentLists";
import { Permission } from "@/lib/backend/types";
import { SettingsIcon } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";


export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    let hasManagementAccess = false;
    if (!session.isAdmin) {
        const permissions = await getCurrentUserPermissions();
        if (permissions?.error !== undefined) {
            redirect('/home');
        }

        const currentPermissions = permissions.permissions || [];
        const hasAccess = currentPermissions.some((permission: Permission) => permission.resourceId === id);
        hasManagementAccess = currentPermissions.some((permission: Permission) => permission.resourceId === id && permission.action === 'manage_recruitment_list' || permission.action === 'delete_recruitment_list');

        if (!hasAccess) {
            redirect('/home');
        }
    }

    const showSettings = hasManagementAccess || session.isAdmin;

    const rlResp = await getRecruitmentList(id);
    if (rlResp.error !== undefined) {
        redirect('/home');
    }

    return (
        <div className="h-full">
            <div className="h-[53px] fixed top-0 left-[53px] z-20 right-0 border-b border-border bg-background px-8 flex items-center justify-between ">
                <h1 className="text-xl font-bold font-mono text-primary">{rlResp?.name}</h1>
                {showSettings && <Button
                    size={'icon'}
                    variant={'ghost'}
                    asChild
                >
                    <Link href={`/home/${id}/settings`}>
                        <SettingsIcon className="size-5" />
                    </Link>
                </Button>}
            </div>
            <div className="pt-[53px] h-full">
                {children}
            </div>
        </div>
    );
}
