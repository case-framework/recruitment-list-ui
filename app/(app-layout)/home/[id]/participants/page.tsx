import { getRecruitmentList } from "@/lib/backend/recruitmentLists";
import ParticipantsView from "./_components/participants-view";
import { getParticipants } from "@/lib/backend/participants";
import { redirect } from "next/navigation";


interface PageProps {
    params: {
        id: string;
    };
    searchParams: {
        sortBy: string;
        sortDir: string;
        // filter attributes
    }
}

export default async function Page(props: PageProps) {

    const [
        recruitmentList,
        participantsPage,
    ] = await Promise.all([
        getRecruitmentList(props.params.id),
        getParticipants(props.params.id, 1, props.searchParams.sortBy, props.searchParams.sortDir),
    ]);

    if (recruitmentList.error !== undefined) {
        redirect('/home');
    }

    let currentPageInfos = participantsPage;
    if (participantsPage.error !== undefined) {
        currentPageInfos = {
            participants: [],
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalCount: 0,
                pageSize: 50,
            }
        }
    }

    if (participantsPage.participants === null || participantsPage.participants === undefined) {
        participantsPage.participants = [];
    }

    return (
        <div className="py-4 px-8 space-y-4">
            <h2 className="text-lg font-bold">
                Participants
            </h2>
            <ParticipantsView
                recruitmentListId={props.params.id}
                participantInfos={recruitmentList.participantData.participantInfos}
                participantsPage={currentPageInfos}
                statusValues={recruitmentList.customization?.recruitmentStatusValues || []}
            />
        </div>
    );
}
