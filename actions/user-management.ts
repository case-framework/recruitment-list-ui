'use server';

import { auth } from '@/auth';
import { fetchRecruitmentListAPI } from '@/lib/backend/fetch-case-management-api';
import { revalidatePath } from 'next/cache';

export const updateUserIsAdmin = async (userId: string, isAdmin: boolean) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized' };
    }

    const url = `/v1/researchers/${userId}/is-admin`;
    const response = await fetchRecruitmentListAPI(
        url,
        session.CASEaccessToken,
        {
            method: 'PUT',
            body: JSON.stringify({ isAdmin }),
            revalidate: 0
        }
    );
    if (response.status !== 200) {
        return { status: response.status, error: response.body.error };
    }

    revalidatePath('/home/user-management');
    return response.body;
}

export const deleteUser = async (userId: string) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized' };
    }

    const url = `/v1/researchers/${userId}`;
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
    revalidatePath('/home/user-management');
    return response.body;
}
