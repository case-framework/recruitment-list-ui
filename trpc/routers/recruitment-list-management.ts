import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { fetchRecruitmentListAPI } from '@/lib/backend/fetch-case-management-api';
import { protectedProcedure, router } from '../init';
import {
    httpStatusToTrpcErrorCode,
    recruitmentListManagementErrorMessages,
} from '../utils';

const recruitmentListTagsResponseSchema = z.object({
    tags: z.array(z.string().min(1)),
});

const recruitmentListInfoSchema = z.looseObject({
    id: z.string().min(1).optional(),
    name: z.string().min(1),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
});

const myRecruitmentListsResponseSchema = z.looseObject({
    recruitmentLists: z.array(recruitmentListInfoSchema).optional(),
});

const updateRecruitmentListTagsResponseSchema = z.object({
    message: z.string().min(1),
});

const updateRecruitmentListTagsInputSchema = z.object({
    id: z.string().min(1),
    tags: z.array(z.string().trim().min(1)),
});

const newRecruitmentListInputSchema = z.object({
    name: z.string().trim().min(2).max(50),
    description: z.string().trim().min(2).max(500),
    tags: z.array(z.string().trim().min(1)).optional(),
});

const createPlaceholderRecruitmentListCreateResponseSchema = z.object({
    id: z.string().min(1),
});


const normalizeTags = (tags: string[] | undefined) => {
    if (!tags) {
        return [];
    }

    return Array.from(new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)));
};

const getErrorMessage = (body: unknown, fallback: string) => {
    if (typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string') {
        return body.error;
    }
    return fallback;
};

const throwForFailedRequest = (status: number, body: unknown, fallback: string) => {
    const code = httpStatusToTrpcErrorCode[status as keyof typeof httpStatusToTrpcErrorCode];
    if (code) {
        throw new TRPCError({ code, message: getErrorMessage(body, fallback) });
    }

    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: getErrorMessage(body, fallback) });
};

export const recruitmentListManagementRouter = router({
    getMyRecruitmentLists: protectedProcedure.query(async ({ ctx }) => {
        const response = await fetchRecruitmentListAPI(
            '/v1/recruitment-lists',
            ctx.token,
            {
                method: 'GET',
                revalidate: 0,
            }
        );
        if (response.status !== 200) {
            throwForFailedRequest(
                response.status,
                response.body,
                recruitmentListManagementErrorMessages.getRecruitmentLists
            );
        }

        const parsed = myRecruitmentListsResponseSchema.safeParse(response.body);
        if (!parsed.success) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: recruitmentListManagementErrorMessages.getRecruitmentLists,
            });
        }

        return {
            ...parsed.data,
            recruitmentLists: parsed.data.recruitmentLists ?? [],
        };
    }),

    getAvailableTags: protectedProcedure.query(async ({ ctx }) => {
        const response = await fetchRecruitmentListAPI(
            '/v1/recruitment-lists/tags',
            ctx.token,
            {
                method: 'GET',
                revalidate: 0,
            }
        );
        if (response.status !== 200) {
            throwForFailedRequest(
                response.status,
                response.body,
                recruitmentListManagementErrorMessages.getRecruitmentListTags
            );
        }

        const parsed = recruitmentListTagsResponseSchema.safeParse(response.body);
        if (!parsed.success) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: recruitmentListManagementErrorMessages.getRecruitmentListTags,
            });
        }

        return parsed.data;
    }),

    createPlaceholderRecruitmentList: protectedProcedure
        .input(newRecruitmentListInputSchema)
        .mutation(async ({ ctx, input }) => {
            const normalizedTags = normalizeTags(input.tags);

            const createResponse = await fetchRecruitmentListAPI(
                '/v1/recruitment-lists',
                ctx.token,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        name: input.name,
                        description: input.description,
                        participantInclusion: {
                            // Keep placeholders explicitly non-configured and manual to avoid sync behavior by default.
                            studyKey: '__not_configured__',
                            type: 'manual',
                        },
                        participantData: {
                            participantInfos: [],
                            researchData: [],
                        },
                        customization: {
                            recruitmentStatusValues: [],
                        },
                    }),
                    revalidate: 0,
                }
            );
            if (createResponse.status !== 200) {
                throwForFailedRequest(
                    createResponse.status,
                    createResponse.body,
                    recruitmentListManagementErrorMessages.createPlaceholderRecruitmentList
                );
            }

            const parsedCreateResponse = createPlaceholderRecruitmentListCreateResponseSchema.safeParse(createResponse.body);
            if (!parsedCreateResponse.success) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: recruitmentListManagementErrorMessages.createPlaceholderRecruitmentList,
                });
            }

            const createdRecruitmentListId = parsedCreateResponse.data.id;
            if (normalizedTags.length > 0) {
                const tagsResponse = await fetchRecruitmentListAPI(
                    `/v1/recruitment-lists/${createdRecruitmentListId}/tags`,
                    ctx.token,
                    {
                        method: 'PUT',
                        body: JSON.stringify({ tags: normalizedTags }),
                        revalidate: 0,
                    }
                );
                if (tagsResponse.status !== 200) {
                    return {
                        id: createdRecruitmentListId,
                        tagsSaved: false,
                        tagsError: getErrorMessage(
                            tagsResponse.body,
                            recruitmentListManagementErrorMessages.updateRecruitmentListTags
                        ),
                    };
                }

                const parsedTagsResponse = updateRecruitmentListTagsResponseSchema.safeParse(tagsResponse.body);
                if (!parsedTagsResponse.success) {
                    return {
                        id: createdRecruitmentListId,
                        tagsSaved: false,
                        tagsError: recruitmentListManagementErrorMessages.updateRecruitmentListTags,
                    };
                }
            }

            return {
                id: createdRecruitmentListId,
                tagsSaved: true,
            };
        }),
    updateRecruitmentListTags: protectedProcedure
        .input(updateRecruitmentListTagsInputSchema)
        .mutation(async ({ ctx, input }) => {
            const response = await fetchRecruitmentListAPI(
                `/v1/recruitment-lists/${input.id}/tags`,
                ctx.token,
                {
                    method: 'PUT',
                    body: JSON.stringify({ tags: input.tags }),
                    revalidate: 0,
                }
            );
            if (response.status !== 200) {
                throwForFailedRequest(
                    response.status,
                    response.body,
                    recruitmentListManagementErrorMessages.updateRecruitmentListTags
                );
            }

            const parsed = updateRecruitmentListTagsResponseSchema.safeParse(response.body);
            if (!parsed.success) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: recruitmentListManagementErrorMessages.updateRecruitmentListTags,
                });
            }

            return parsed.data;
        }),
});
