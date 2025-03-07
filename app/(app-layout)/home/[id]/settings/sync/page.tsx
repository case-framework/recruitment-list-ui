import { getSyncInfos } from "@/lib/backend/recruitmentLists";
import { redirect } from "next/navigation";
import SyncInfoDisplay from "./_components/sync-info-display";

interface PageParams {
    params: {
        id: string;
    }
}

export default async function Page(props: PageParams) {
    const rlResp = await getSyncInfos(props.params.id);
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
