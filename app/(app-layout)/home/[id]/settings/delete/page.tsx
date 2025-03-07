import { getRecruitmentList } from "@/lib/backend/recruitmentLists";
import { redirect } from "next/navigation";
import DeleteRl from "./_components/delete-rl";

export default async function Page(props: {
    params: {
        id: string;
    }
}) {

    const rlResp = await getRecruitmentList(props.params.id);
    if (rlResp.error !== undefined) {
        redirect('/home');
    }


    return (
        <DeleteRl
            listName={rlResp.name}
            listId={rlResp.id}
        />
    );
}
