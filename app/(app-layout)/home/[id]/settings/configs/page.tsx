import RecruitmentListEditor from "@/components/recruitment-list-editor/recruitment-list-editor";
import { hasCreateRecruitmentListPermission } from "@/lib/backend/permissions";
import { getRecruitmentList } from "@/lib/backend/recruitmentLists";
import { redirect } from "next/navigation";
import ConfigTransferActions from "./_components/config-transfer-actions";

interface PageParams {
    params: Promise<{
        id: string;
    }>
}

export default async function Page(props: PageParams) {
    const { id } = await props.params;

    const allowedToCreateRecruitmentList = await hasCreateRecruitmentListPermission();
    const rlResp = await getRecruitmentList(id);
    if (rlResp.error !== undefined) {
        redirect('/home');
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">List configuration</h1>
                    <p className="text-sm text-muted-foreground">
                        Update list setup, filters, and customisation settings.
                    </p>
                </div>
                <ConfigTransferActions
                    recruitmentList={rlResp}
                    canDuplicate={allowedToCreateRecruitmentList}
                />
            </div>

            <RecruitmentListEditor
                recruitmentList={rlResp}
            />
        </div>

    );
}
