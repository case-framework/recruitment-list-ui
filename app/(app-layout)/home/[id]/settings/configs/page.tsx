import RecruitmentListEditor from "@/components/recruitment-list-editor/recruitment-list-editor";
import { getRecruitmentList } from "@/lib/backend/recruitmentLists";
import { redirect } from "next/navigation";

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

        <RecruitmentListEditor
            recruitmentList={rlResp}
        />

    );
}
