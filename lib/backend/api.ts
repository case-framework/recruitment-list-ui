import logger from "../logger";

export const getRecruitmentListAPIURL = (path: string): URL => {
    const baseURL = process.env.RECRUITMENT_LIST_API_URL;
    if (!baseURL) {
        logger.error("Can't construct recruitment list API URL because RECRUITMENT_LIST_API_URL is not set");
        throw new Error('RECRUITMENT_LIST_API_URL is not set');
    }
    return new URL(path, baseURL);
}


export const getTokenHeader = (accessToken?: string): object | { Autorization: string } => {
    if (!accessToken) {
        return {};
    }
    return {
        'Authorization': `Bearer ${accessToken}`
    }
}
