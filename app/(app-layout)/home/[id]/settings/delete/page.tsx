import { getRecruitmentList } from "@/lib/backend/recruitmentLists";
import { redirect } from "next/navigation";
import DeleteRl from "./_components/delete-rl";

export default async function Page(props: {
    params: Promise<{
        id: string;
    }>
}) {
    const { id } = await props.params;

    const rlResp = await getRecruitmentList(id);
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
