import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { fetchRecruitmentListAPI } from '@/lib/backend/fetch-case-management-api';
import { protectedProcedure, router } from '../init';
import {
    httpStatusToTrpcErrorCode,
    userManagementErrorMessages,
} from '../utils';
import logger from '@/lib/logger';

const researcherUserSchema = z.looseObject({
    id: z.string().min(1),
    sub: z.string().nullish().transform((value) => value ?? ''),
    email: z.string().nullish().transform((value) => value ?? ''),
    username: z.string().nullish().transform((value) => value ?? ''),
    imageUrl: z.string().nullish().transform((value) => value ?? ''),
    isAdmin: z.boolean().default(false),
    lastLoginAt: z.string().nullish().transform((value) => value ?? ''),
    createdAt: z.string().nullish().transform((value) => value ?? ''),
});

const recruitmentListSchema = z.looseObject({
    id: z.string().optional(),
    name: z.string().min(1),
    description: z.string().nullish().transform((value) => value ?? ''),
    tags: z.array(z.string()).nullish().transform((value) => value ?? []),
});

const permissionSchema = z.looseObject({
    id: z.string().min(1),
    userId: z.string().min(1),
    resourceId: z.string().nullish().transform((value) => value ?? undefined),
    action: z.string().min(1),
    createdAt: z.string().nullish().transform((value) => value ?? ''),
    createdBy: z.string().nullish().transform((value) => value ?? ''),
});

const researchersResponseSchema = z.object({
    researchers: z.array(researcherUserSchema).default([]),
});

const userPermissionsResponseSchema = z.object({
    permissions: z.array(permissionSchema).default([]).nullable(),
});

const recruitmentListsResponseSchema = z.object({
    recruitmentLists: z.array(recruitmentListSchema).default([]).nullable(),
});

const getUserDetailsInputSchema = z.object({
    userId: z.string().min(1),
});

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

const ensureAdmin = (isAdmin: boolean) => {
    if (!isAdmin) {
        throw new TRPCError({
            code: 'FORBIDDEN',
            message: userManagementErrorMessages.forbidden,
        });
    }
};

export const userManagementRouter = router({
    getUsers: protectedProcedure.query(async ({ ctx }) => {
        ensureAdmin(ctx.isAdmin);

        const [researchersResponse, recruitmentListsResponse] = await Promise.all([
            fetchRecruitmentListAPI('/v1/researchers', ctx.token, {
                method: 'GET',
                revalidate: 0,
            }),
            fetchRecruitmentListAPI('/v1/recruitment-lists', ctx.token, {
                method: 'GET',
                revalidate: 0,
            }),
        ]);

        if (researchersResponse.status !== 200) {
            throwForFailedRequest(
                researchersResponse.status,
                researchersResponse.body,
                userManagementErrorMessages.getUsers
            );
        }

        if (recruitmentListsResponse.status !== 200) {
            throwForFailedRequest(
                recruitmentListsResponse.status,
                recruitmentListsResponse.body,
                userManagementErrorMessages.getRecruitmentLists
            );
        }

        const parsedResearchers = researchersResponseSchema.safeParse(researchersResponse.body);
        if (!parsedResearchers.success) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: userManagementErrorMessages.getUsers,
            });
        }

        const parsedRecruitmentLists = recruitmentListsResponseSchema.safeParse(recruitmentListsResponse.body);
        if (!parsedRecruitmentLists.success) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: userManagementErrorMessages.getRecruitmentLists,
            });
        }

        const permissionsByUser = await Promise.all(
            parsedResearchers.data.researchers.map(async (user) => {
                const permissionsResponse = await fetchRecruitmentListAPI(
                    `/v1/researchers/${user.id}/permissions`,
                    ctx.token,
                    {
                        method: 'GET',
                        revalidate: 0,
                    }
                );

                if (permissionsResponse.status !== 200) {
                    throwForFailedRequest(
                        permissionsResponse.status,
                        permissionsResponse.body,
                        userManagementErrorMessages.getPermissions
                    );
                }

                const parsedPermissions = userPermissionsResponseSchema.safeParse(permissionsResponse.body);
                if (!parsedPermissions.success) {
                    logger.error(parsedPermissions.error.message);
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: userManagementErrorMessages.getPermissions,
                    });
                }

                return [user.id, parsedPermissions.data.permissions] as const;
            })
        );

        const resourceNameById = new Map(
            parsedRecruitmentLists.data.recruitmentLists?.filter((list) => typeof list.id === 'string' && list.id.length > 0)
                .map((list) => [list.id as string, list.name])
        );

        const permissionsByUserId = new Map(permissionsByUser);
        const users = parsedResearchers.data.researchers
            .map((user) => {
                const permissions = permissionsByUserId.get(user.id) ?? [];
                const resourceIds = Array.from(
                    new Set(
                        permissions
                            .map((permission) => permission.resourceId)
                            .filter((resourceId): resourceId is string => Boolean(resourceId))
                    )
                );

                const resourceNames = resourceIds.map((resourceId) => resourceNameById.get(resourceId) ?? resourceId);

                return {
                    ...user,
                    resourceIds,
                    resourceNames,
                    resourceCount: resourceIds.length,
                };
            })
            .sort((left, right) => left.username.localeCompare(right.username, undefined, { sensitivity: 'base' }));

        return {
            users,
        };
    }),

    getUserDetails: protectedProcedure
        .input(getUserDetailsInputSchema)
        .query(async ({ ctx, input }) => {
            ensureAdmin(ctx.isAdmin);

            const [userResponse, permissionsResponse, recruitmentListsResponse] = await Promise.all([
                fetchRecruitmentListAPI(`/v1/researchers/${input.userId}`, ctx.token, {
                    method: 'GET',
                    revalidate: 0,
                }),
                fetchRecruitmentListAPI(`/v1/researchers/${input.userId}/permissions`, ctx.token, {
                    method: 'GET',
                    revalidate: 0,
                }),
                fetchRecruitmentListAPI('/v1/recruitment-lists', ctx.token, {
                    method: 'GET',
                    revalidate: 0,
                }),
            ]);

            if (userResponse.status !== 200) {
                throwForFailedRequest(
                    userResponse.status,
                    userResponse.body,
                    userManagementErrorMessages.getUserDetails
                );
            }

            if (permissionsResponse.status !== 200) {
                logger.error(permissionsResponse.body);
                throwForFailedRequest(
                    permissionsResponse.status,
                    permissionsResponse.body,
                    userManagementErrorMessages.getPermissions
                );
            }

            if (recruitmentListsResponse.status !== 200) {
                throwForFailedRequest(
                    recruitmentListsResponse.status,
                    recruitmentListsResponse.body,
                    userManagementErrorMessages.getRecruitmentLists
                );
            }

            const parsedUser = researcherUserSchema.safeParse(userResponse.body);
            if (!parsedUser.success) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: userManagementErrorMessages.getUserDetails,
                });
            }

            const parsedPermissions = userPermissionsResponseSchema.safeParse(permissionsResponse.body);
            if (!parsedPermissions.success) {
                logger.error(parsedPermissions.error.message);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: userManagementErrorMessages.getPermissions,
                });
            }

            const parsedRecruitmentLists = recruitmentListsResponseSchema.safeParse(recruitmentListsResponse.body);
            if (!parsedRecruitmentLists.success) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: userManagementErrorMessages.getRecruitmentLists,
                });
            }

            return {
                user: parsedUser.data,
                permissions: parsedPermissions.data.permissions,
                recruitmentLists: parsedRecruitmentLists.data.recruitmentLists,
            };
        }),
});
