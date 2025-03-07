'use server'

import { auth } from "@/auth";
import { fetchRecruitmentListAPI } from "./fetch-case-management-api";
import { revalidatePath } from "next/cache";

export const getAvailableResearchDataInfos = async (
    recruitmentListId: string,
    pid?: string,
    startDate?: string,
    endDate?: string,
) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized', researchers: [] };
    }

    const query = new URLSearchParams();
    if (pid) {
        query.append('pid', pid);
    }
    if (startDate) {
        query.append('startDate', startDate);
    }
    if (endDate) {
        query.append('endDate', endDate);
    }
    const url = `/v1/recruitment-lists/${recruitmentListId}/available-responses?${query.toString()}`;
    const response = await fetchRecruitmentListAPI(
        url,
        session.CASEaccessToken,
        {
            method: 'GET',
            revalidate: 0,
        }
    );
    if (response.status !== 200) {
        return { status: response.status, error: response.body.error };
    }

    return response.body;
}

export const getDownloads = async (recruitmentListId: string) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized', researchers: [] };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}/downloads`;
    const response = await fetchRecruitmentListAPI(
        url,
        session.CASEaccessToken,
        {
            method: 'GET',
            revalidate: 0,
        }
    );
    if (response.status !== 200) {
        return { status: response.status, error: response.body.error };
    }

    return response.body;
}

export const startResponseDownload = async (
    recruitmentListId: string,
    surveyKey: string,
    format: string,
    participantId?: string,
    startDate?: string,
    endDate?: string,
) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized', researchers: [] };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}/downloads/prepare-response-file`;
    const response = await fetchRecruitmentListAPI(
        url,
        session.CASEaccessToken,
        {
            method: 'POST',
            body: JSON.stringify({
                surveyKey,
                format,
                participantId,
                startDate,
                endDate,
            }),
            revalidate: 0,
        }
    );
    if (response.status !== 200) {
        return { status: response.status, error: response.body.error };
    }

    revalidatePath(`/home/${recruitmentListId}`);

    return response.body;
}

export const startParticipantInfoDownload = async (
    recruitmentListId: string,
    format: string,
) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized', researchers: [] };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}/downloads/prepare-participant-infos-file`;
    const response = await fetchRecruitmentListAPI(
        url,
        session.CASEaccessToken,
        {
            method: 'POST',
            body: JSON.stringify({
                format,
            }),
            revalidate: 0,
        }
    );
    if (response.status !== 200) {
        return { status: response.status, error: response.body.error };
    }
    revalidatePath(`/home/${recruitmentListId}`);

    return response.body;
}

export const getDownloadStatus = async (
    recruitmentListId: string,
    downloadId: string,
) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized', researchers: [] };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}/downloads/${downloadId}/status`;
    const response = await fetchRecruitmentListAPI(
        url,
        session.CASEaccessToken,
        {
            method: 'GET',
            revalidate: 0,
        }
    );
    if (response.status !== 200) {
        return { status: response.status, error: response.body.error };
    }

    return response.body;
}

export const deleteDownload = async (
    recruitmentListId: string,
    downloadId: string,
) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized', researchers: [] };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}/downloads/${downloadId}`;
    const response = await fetchRecruitmentListAPI(
        url,
        session.CASEaccessToken,
        {
            method: 'DELETE',
            revalidate: 0,
        }
    );
    if (response.status !== 200) {
        return { status: response.status, error: response.body.error };
    }

    revalidatePath(`/home/${recruitmentListId}`);

    return response.body;
}