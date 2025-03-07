'use server'

import { auth } from "@/auth";
import { fetchRecruitmentListAPI } from "./fetch-case-management-api";
import { revalidatePath } from "next/cache";
import { Permission } from "./types";

export const getCurrentUserPermissions = async () => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized', researchers: [] };
    }

    const url = '/v1/auth/permissions';
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

export const hasCreateRecruitmentListPermission = async () => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return false;
    }
    if (session.isAdmin === true) {
        return true;
    }

    const permissions = await getCurrentUserPermissions();
    if (permissions.error !== undefined) {
        return false;
    }
    const currentPermissions = permissions.permissions || [];
    return currentPermissions.some((permission: Permission) => permission.action === 'create_recruitment_list');
}


export const getUserPermissions = async (userId: string) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized', researchers: [] };
    }

    const url = `/v1/researchers/${userId}/permissions`;
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

export const addUserPermission = async (
    userId: string,
    permission: {
        action: string,
        resourceId?: string
    }
) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized', researchers: [] };
    }

    const url = `/v1/researchers/${userId}/permissions`;
    const response = await fetchRecruitmentListAPI(
        url,
        session.CASEaccessToken,
        {
            method: 'POST',
            body: JSON.stringify(permission),
            revalidate: 0
        }
    );
    if (response.status !== 200) {
        return { status: response.status, error: response.body.error };
    }

    revalidatePath('/home');

    return response.body;
}

export const deleteUserPermission = async (
    userId: string,
    permissionId: string
) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized', researchers: [] };
    }

    const url = `/v1/researchers/${userId}/permissions/${permissionId}`;
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

export const getRecruitmentListPermissions = async (recruitmentListId: string) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized' };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}/permissions`;
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

export const addRecruitmentListPermission = async (
    recruitmentListId: string,
    permission: {
        action: string,
        userId: string,
    }
) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized' };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}/permissions`;
    const response = await fetchRecruitmentListAPI(
        url,
        session.CASEaccessToken,
        {
            method: 'POST',
            body: JSON.stringify(permission),
            revalidate: 0
        }
    );
    if (response.status !== 200) {
        return { status: response.status, error: response.body.error };
    }

    revalidatePath('/home');

    return response.body;
}

export const deleteRecruitmentListPermission = async (
    recruitmentListId: string,
    permissionId: string
) => {
    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return { status: 401, error: 'Unauthorized' };
    }

    const url = `/v1/recruitment-lists/${recruitmentListId}/permissions/${permissionId}`;
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