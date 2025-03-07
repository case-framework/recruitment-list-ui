'use server'
import { auth } from "@/auth";
import { fetchRecruitmentListAPI } from "./fetch-case-management-api";


export const getResearchers = async () => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized', researchers: [] };
    }

    const url = '/v1/researchers';
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

export const getResearcher = async (researcherId: string) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized' };
    }

    const url = `/v1/researchers/${researcherId}`;
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