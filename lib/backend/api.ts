
export const getRecruitmentListAPIURL = (path: string): URL => {
    return new URL(path, process.env.RECRUITMENT_LIST_API_URL ? process.env.RECRUITMENT_LIST_API_URL : '');
}


export const getTokenHeader = (accessToken?: string): object | { Autorization: string } => {
    if (!accessToken) {
        return {};
    }
    return {
        'Authorization': `Bearer ${accessToken}`
    }
}
