'use server'

import { auth } from "@/auth";
import { fetchRecruitmentListAPI } from "./fetch-case-management-api";
import { revalidatePath } from "next/cache";

export const importParticipant = async (recruitmentListId: string, participantId: string) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized', researchers: [] };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}/import-participant`;
    const response = await fetchRecruitmentListAPI(
        url,
        session.CASEaccessToken,
        {
            method: 'POST',
            revalidate: 0,
            body: JSON.stringify({ participantId }),
        }
    );
    if (response.status !== 200) {
        return { status: response.status, error: response.body.error };
    }

    revalidatePath('/home');

    return response.body;
}

export const getParticipants = async (recruitmentListId: string, page: number) => {
    const session = await auth();

    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized', researchers: [] };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}/participants?page=${page}`;
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

export const getParticipant = async (recruitmentListId: string, participantId: string) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized', researchers: [] };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}/participants/${participantId}`;
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

export const updateParticipantStatus = async (recruitmentListId: string, participantId: string, status: string) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized', researchers: [] };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}/participants/${participantId}/status`;
    const response = await fetchRecruitmentListAPI(
        url,
        session.CASEaccessToken,
        {
            method: 'POST',
            body: JSON.stringify({ status }),
            revalidate: 0,
        }
    );
    if (response.status !== 200) {
        return { status: response.status, error: response.body.error };
    }
    revalidatePath(`/home/${recruitmentListId}/participants`);
    return response.body;
}


export const getParticipantNotes = async (recruitmentListId: string, participantId: string) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized', researchers: [] };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}/participants/${participantId}/notes`;
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

export const createParticipantNote = async (recruitmentListId: string, participantId: string, note: string) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized', researchers: [] };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}/participants/${participantId}/notes`;
    const response = await fetchRecruitmentListAPI(
        url,
        session.CASEaccessToken,
        {
            method: 'POST',
            revalidate: 0,
            body: JSON.stringify({ note }),
        }
    );
    if (response.status !== 200) {
        return { status: response.status, error: response.body.error };
    }

    revalidatePath(`/home/${recruitmentListId}/participants/${participantId}`);

    return response.body;
}

export const deleteParticipantNote = async (recruitmentListId: string, participantId: string, noteId: string) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized', researchers: [] };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}/participants/${participantId}/notes/${noteId}`;
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

    revalidatePath(`/home/${recruitmentListId}/participants/${participantId}`);

    return response.body;
}