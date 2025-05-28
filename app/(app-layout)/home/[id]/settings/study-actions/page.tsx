import { getRecruitmentList } from "@/lib/backend/recruitmentLists";
import { redirect } from "next/navigation";
import StudyActionsContent from "./_components/study-actions-content";

interface PageParams {
    params: {
        id: string;
    }
}

export default async function Page(props: PageParams) {
    const rlResp = await getRecruitmentList(props.params.id);
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