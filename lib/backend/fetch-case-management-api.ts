'use server'

import { getRecruitmentListAPIURL, getTokenHeader } from "./api";

export const fetchRecruitmentListAPI = async (
    pathname: string,
    accessToken?: string,
    requestOptions?: {
        headers?: { [key: string]: string },
        method?: string,
        body?: BodyInit,
        revalidate: number,
    }
) => {
    const { headers, method = 'GET', body, revalidate = 0 } = requestOptions || {};

    const url = getRecruitmentListAPIURL(pathname);
    const response = await fetch(url, {
        method,
        headers: {
            ...getTokenHeader(accessToken),
            ...headers,
        },
        body: body,
        next: {
            revalidate: revalidate,
        }
    });

    try {
        const responseBody = await response.json();
        return {
            status: response.status,
            body: responseBody,
        };
    } catch (e) {
        return {
            status: response.status,
            body: { error: response.statusText },
        };
    }
}
