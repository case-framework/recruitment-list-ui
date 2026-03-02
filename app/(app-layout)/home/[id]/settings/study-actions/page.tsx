import { getRecruitmentList } from "@/lib/backend/recruitmentLists";
import { redirect } from "next/navigation";
import StudyActionsContent from "./_components/study-actions-content";

interface PageParams {
    params: Promise<{
        id: string;
    }>
}

export default async function Page(props: PageParams) {
    const { id } = await props.params;
    const rlResp = await getRecruitmentList(id);
    if (rlResp.error !== undefined) {
        redirect('/home');
    }

    return (
        <div>
            <StudyActionsContent
                recruitmentList={rlResp}
            />
        </div>
    );
}
