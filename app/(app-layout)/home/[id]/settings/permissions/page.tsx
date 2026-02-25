import { getRecruitmentListPermissions } from "@/lib/backend/permissions";
import { redirect } from "next/navigation";
import PermissionEditor from "./_components/permission-editor";
import { getResearchers } from "@/lib/backend/researchers";


interface PageParams {
    params: Promise<{
        id: string;
    }>
}

export default async function Page(props: PageParams) {
    const { id } = await props.params;

    const [resp, researchersResp] = await Promise.all([
        getRecruitmentListPermissions(id),
        getResearchers(),
    ]);
    if (resp.error !== undefined) {
        redirect('/home');
    }

    if (researchersResp.error !== undefined) {
        console.error(researchersResp.error);
    }

    return (
        <div className="space-y-4 max-w-2xl">
            <h2 className="text-lg font-bold">
                Permissions
            </h2>
            <PermissionEditor
                permissions={resp.permissions || []}
                recruitmentListId={id}
                users={researchersResp.researchers || []}
            />

        </div>
    );
}
