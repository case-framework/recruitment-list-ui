import { auth } from "@/auth";
import { getRecruitmentListAPIURL, getTokenHeader } from "@/lib/backend/api";
import { NextResponse } from "next/server";

type Params = {
    id: string;
    downloadId: string;
};

export async function GET(request: Request, context: { params: Params }) {
    const recruitmentListId = context.params.id;
    const downloadId = context.params.downloadId;

    const session = await auth();
    if (!session || !session.CASEaccessToken) {
        return new NextResponse(
            JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const pathname = `/v1/recruitment-lists/${recruitmentListId}/downloads/${downloadId}`;
    const url = getRecruitmentListAPIURL(pathname);
    const apiResponse = await fetch(url, {
        method: 'GET',
        headers: {
            ...getTokenHeader(
                session.CASEaccessToken
            ),
        },
    });

    const resp = new NextResponse(apiResponse.body, {
        status: apiResponse.status,
        headers: {
            'Content-Type': apiResponse.headers.get('Content-Type') || 'application/json',
            'Content-Disposition': apiResponse.headers.get('Content-Disposition') || '',
        }
    });
    return resp;
}