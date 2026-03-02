import { getRecruitmentList } from "@/lib/backend/recruitmentLists";
import ParticipantsView from "./_components/participants-view";
import { getParticipants } from "@/lib/backend/participants";
import { redirect } from "next/navigation";
import { parseParticipantInfoFiltersFromObject } from "@/lib/participants/filter-utils";


interface PageProps {
    params: Promise<{
        id: string;
    }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const normalizeSearchParamValue = (value: string | string[] | undefined) => {
    if (Array.isArray(value)) {
        return value[0];
    }

    return value;
}

export default async function Page(props: PageProps) {
    const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
    const participantId = normalizeSearchParamValue(searchParams.participantId) || null;
    const recruitmentStatus = normalizeSearchParamValue(searchParams.recruitmentStatus) || null;
    const includedSince = normalizeSearchParamValue(searchParams.includedSince) || null;
    const includedUntil = normalizeSearchParamValue(searchParams.includedUntil) || null;
    const sortBy = normalizeSearchParamValue(searchParams.sortBy);
    const sortDir = normalizeSearchParamValue(searchParams.sortDir);
    const infoFilters = parseParticipantInfoFiltersFromObject(searchParams);

    const hasFilters = participantId ||
        recruitmentStatus ||
        includedSince ||
        includedUntil ||
        Object.keys(infoFilters).length > 0;

    const pFilters = hasFilters ? {
        participantId,
        recruitmentStatus,
        includedSince,
        includedUntil,
        infos: infoFilters,
    } : undefined;


    const [
        recruitmentList,
        participantsPage,
    ] = await Promise.all([
        getRecruitmentList(params.id),
        getParticipants(params.id, 1, pFilters, sortBy || undefined, sortDir || undefined),
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
                recruitmentListId={params.id}
                participantInfos={recruitmentList.participantData.participantInfos}
                participantsPage={currentPageInfos}
                statusValues={recruitmentList.customization?.recruitmentStatusValues || []}
            />
        </div>
    );
}
