import { fetchRecruitmentListAPI } from "./fetch-case-management-api";

interface IdPLoginMsg {
    sub: string;
    name?: string;
    email?: string;
    imageURL?: string;
    roles?: string[];
    renewToken?: string;
}


export const signInWithIdPRequest = async (creds: IdPLoginMsg): Promise<{
    sessionID: string;
    accessToken: string;
    expiresAt: number;
    isAdmin: boolean;
}> => {
    const url = '/v1/auth/signin-with-idp';
    const resp = await fetchRecruitmentListAPI(
        url,
        undefined,
        {
            method: 'POST',
            body: JSON.stringify(creds),
            revalidate: 0
        }
    );
    if (resp.status !== 200) {
        throw new Error(`Failed to sign in with idp: ${resp.status} - ${resp.body.error}`);
    }
    return resp.body;
}

export const getRenewTokenRequest = async (accessToken: string, sessionId: string): Promise<{
    renewToken: string;
}> => {
    const url = `/v1/auth/renew-token/${sessionId}`;
    const response = await fetchRecruitmentListAPI(
        url,
        accessToken,
        {
            method: 'GET',
            revalidate: 0
        }
    );
    if (response.status !== 200) {
        throw new Error(`Failed to renew token: ${response.status} - ${response.body.error}`);
    }
    return response.body;
}

export const extendSessionRequest = async (accessToken: string, newRenewToken: string): Promise<{
    sessionID: string;
    accessToken: string;
    expiresAt: number;
    isAdmin: boolean;
}> => {
    const url = '/v1/auth/extend-session';
    const response = await fetchRecruitmentListAPI(
        url,
        accessToken,
        {
            method: 'POST',
            body: JSON.stringify({ renewToken: newRenewToken }),
            revalidate: 0
        }
    );
    if (response.status !== 200) {
        throw new Error(`Failed to extend session: ${response.status} - ${response.body.error}`);
    }
    return response.body;
}