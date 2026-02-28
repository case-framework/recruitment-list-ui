import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

export function getUrl() {
  const base = (() => {
    if (typeof window !== 'undefined') return '';
    if (process.env.APP_BASE_URL) return `https://${process.env.APP_BASE_URL}`;
    return 'http://localhost:3000';
  })();
  return `${base}/api/trpc`;
}

export enum TRPCErrorCodes {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

export const httpStatusToTrpcErrorCode = {
  400: TRPCErrorCodes.BAD_REQUEST,
  401: TRPCErrorCodes.UNAUTHORIZED,
  403: TRPCErrorCodes.FORBIDDEN,
  404: TRPCErrorCodes.NOT_FOUND,
} as const satisfies Record<number, TRPC_ERROR_CODE_KEY>;

export const recruitmentListManagementErrorMessages = {
  getRecruitmentLists: 'could not get recruitment lists',
  getRecruitmentListTags: 'could not get recruitment list tags',
  createPlaceholderRecruitmentList: 'could not create recruitment list',
  updateRecruitmentListTags: 'could not update recruitment list tags',
} as const;
