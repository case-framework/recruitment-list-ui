import { getSyncInfos } from "@/lib/backend/recruitmentLists";
import { redirect } from "next/navigation";
import SyncInfoDisplay from "./_components/sync-info-display";

interface PageParams {
    params: Promise<{
        id: string;
    }>
}

export default async function Page(props: PageParams) {
    const { id } = await props.params;
    const rlResp = await getSyncInfos(id);
    if (rlResp.error !== undefined) {
        redirect('/home');
    }

    return (
        <div>
            <SyncInfoDisplay
                syncInfos={rlResp}
            />
        </div>
    );
}
