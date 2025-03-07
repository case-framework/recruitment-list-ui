'use server'

import { auth } from "@/auth";
import { fetchRecruitmentListAPI } from "./fetch-case-management-api";
import { RecruitmentList } from "./types";
import { revalidatePath } from "next/cache";

export const getRecruitmentLists = async () => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized', researchers: [] };
    }

    const url = '/v1/recruitment-lists';
    const response = await fetchRecruitmentListAPI(
        url,
        session.CASEaccessToken,
        {
            method: 'GET',
            revalidate: 0
        }
    );
    if (response.status !== 200) {
        return { status: response.status, error: response.body.error };
    }

    return response.body;
}

export const createRecruitmentList = async (recruitmentList: RecruitmentList) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized', researchers: [] };
    }

    const url = '/v1/recruitment-lists';
    const response = await fetchRecruitmentListAPI(
        url,
        session.CASEaccessToken,
        {
            method: 'POST',
            body: JSON.stringify(recruitmentList),
            revalidate: 0
        }
    );
    if (response.status !== 200) {
        return { status: response.status, error: response.body.error };
    }

    revalidatePath('/home');

    return response.body;
}

export const updateRecruitmentList = async (recruitmentListId: string, recruitmentList: RecruitmentList) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized' };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}`;
    const response = await fetchRecruitmentListAPI(
        url,
        session.CASEaccessToken,
        {
            method: 'PUT',
            body: JSON.stringify(recruitmentList),
            revalidate: 0
        }
    );
    if (response.status !== 200) {
        return { status: response.status, error: response.body.error };
    }

    revalidatePath('/home');

    return response.body;
}

export const getRecruitmentList = async (recruitmentListId: string) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized' };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}`;
    const response = await fetchRecruitmentListAPI(
        url,
        session.CASEaccessToken,
        {
            method: 'GET',
            revalidate: 0
        }
    );
    if (response.status !== 200) {
        return { status: response.status, error: response.body.error };
    }

    return response.body;
}

export const deleteRecruitmentList = async (recruitmentListId: string) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized' };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}`;
    const response = await fetchRecruitmentListAPI(
        url,
        session.CASEaccessToken,
        {
            method: 'DELETE',
            revalidate: 0
        }
    );
    if (response.status !== 200) {
        return { status: response.status, error: response.body.error };
    }

    revalidatePath('/home');

    return response.body;
}

export const getSyncInfos = async (recruitmentListId: string) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized' };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}/sync-infos`;
    const response = await fetchRecruitmentListAPI(
        url,
        session.CASEaccessToken,
        {
            method: 'GET',
            revalidate: 0
        }
    );
    if (response.status !== 200) {
        return { status: response.status, error: response.body.error };
    }

    revalidatePath('/home');

    return response.body;
}

export const syncParticipantsNow = async (recruitmentListId: string) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized' };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}/sync-participants`;
    const response = await fetchRecruitmentListAPI(
        url,
        session.CASEaccessToken,
        {
            method: 'POST',
            revalidate: 0
        }
    );
    if (response.status !== 200) {
        return { status: response.status, error: response.body.error };
    }

    revalidatePath('/home');
    return response.body;
}

export const syncResponsesNow = async (recruitmentListId: string) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized' };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}/sync-responses`;
    const response = await fetchRecruitmentListAPI(
        url,
        session.CASEaccessToken,
        {
            method: 'POST',
            revalidate: 0
        }
    );
    if (response.status !== 200) {
        return { status: response.status, error: response.body.error };
    }

    revalidatePath('/home');
    return response.body;
}

export const resetParticipantSyncTimeNull = async (recruitmentListId: string) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized' };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}/reset-participant-sync`;
    const response = await fetchRecruitmentListAPI(
        url,
        session.CASEaccessToken,
        {
            method: 'POST',
            revalidate: 0
        }
    );
    if (response.status !== 200) {
        return { status: response.status, error: response.body.error };
    }

    revalidatePath('/home');
    return response.body;
}

export const resetDataSyncTimeNull = async (recruitmentListId: string) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized' };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}/reset-data-sync`;
    const response = await fetchRecruitmentListAPI(
        url,
        session.CASEaccessToken,
        {
            method: 'POST',
            revalidate: 0
        }
    );
    if (response.status !== 200) {
        return { status: response.status, error: response.body.error };
    }

    revalidatePath('/home');
    return response.body;
}