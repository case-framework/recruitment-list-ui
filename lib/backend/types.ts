import { z } from "zod";

export type FetchError = {
    status: number
    error: string
}

export type ResearcherUser = {
    id: string
    sub: string
    email: string
    username: string
    imageUrl: string
    isAdmin: boolean
    lastLoginAt: string
    createdAt: string
}

export type Permission = {
    id: string
    userId: string
    resourceId?: string
    action: string
    createdAt: string
    createdBy: string
    limiter?: { [key: string]: string }
}




export const recruitmentListInfoSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2).max(50),
    description: z.string().min(2).max(500),
    createdAt: z.date().optional(),
    createdBy: z.string().optional(),
})
export type RecruitmentListInfo = z.infer<typeof recruitmentListInfoSchema>;


export type ParticipantCriteriaCondition = {
    type: string,
    key: string,
    value?: string
}

export type ParticipantCriteriaOperator = {
    operator: 'and' | 'or',
    conditions: Array<ParticipantCriteriaCondition | ParticipantCriteriaOperator>
}

// Define the ParticipantCriteriaCondition schema
export const participantCriteriaConditionSchema = z.object({
    type: z.string(),
    key: z.string(),
    value: z.string().optional()
});

// Define the ParticipantCriteriaOperator schema
export const participantCriteriaOperatorSchema: z.ZodType<ParticipantCriteriaOperator> = z.lazy(() =>
    z.object({
        operator: z.enum(['and', 'or']),
        conditions: z.array(
            z.union([
                participantCriteriaConditionSchema,
                participantCriteriaOperatorSchema
            ])
        )
    })
);

export const autoConfigSchema = z.object({
    criteria: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
})

export type AutoConfig = z.infer<typeof autoConfigSchema>;

export const participantInclusionSchema = z.object({
    studyKey: z.string().min(1),
    type: z.enum(['manual', 'auto']),
    autoConfig: autoConfigSchema.optional(),
    notificationEmails: z.array(z.string()).optional(),
})

export type ParticipantInclusion = z.infer<typeof participantInclusionSchema>;

export const participantInfoSchema = z.object({
    id: z.string(),
    label: z.string(),
    sourceType: z.string(),
    sourceKey: z.string({ required_error: 'Source key is required' }),
    showInPreview: z.boolean().optional(),
    mappingType: z.string().optional(),
    mapping: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
})
export type ParticipantInfo = z.infer<typeof participantInfoSchema>;

export const researchDataSchema = z.object({
    id: z.string(),
    surveyKey: z.string(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    excludedColumns: z.array(z.string()).optional(),
})

export type ResearchData = z.infer<typeof researchDataSchema>;

export const participantDataSchema = z.object({
    participantInfos: z.array(participantInfoSchema),
    researchData: z.array(researchDataSchema),
})

export type ParticipantData = z.infer<typeof participantDataSchema>;

export const listCustomizationSchema = z.object({
    recruitmentStatusValues: z.array(z.string()).optional()
})

export type ListCustomization = z.infer<typeof listCustomizationSchema>;

export const exclusionConditionSchema = z.object({
    key: z.string(),
    value: z.string(),
})

export type ExclusionCondition = z.infer<typeof exclusionConditionSchema>;

export const studyActionSchema = z.object({
    id: z.string(),
    label: z.string().min(3, { message: 'Label must be at least 3 characters' }),
    description: z.string().min(3, { message: 'Describe the intent of the action' }),
    encodedAction: z.string().min(3, { message: 'Upload a valid action file' }),
})

export type StudyAction = z.infer<typeof studyActionSchema>;

export const recruitmentListSchema = recruitmentListInfoSchema.extend({
    participantInclusion: participantInclusionSchema,
    exclusionConditions: z.array(exclusionConditionSchema).optional(),
    participantData: participantDataSchema,
    customization: listCustomizationSchema,
    studyActions: z.array(studyActionSchema).optional(),
});

export type RecruitmentList = z.infer<typeof recruitmentListSchema>;



export type Participant = {
    id: string
    participantId: string
    recruitmentListId: string
    includedAt: string
    includedBy: string
    deletedAt: string
    recruitmentStatus: string
    infos: { [key: string]: string }
}


export type ParticipantNote = {
    id: string
    pid: string
    recruitmentListId: string
    createdAt: string
    createdBy: string
    createdById: string
    note: string
}

export type Download = {
    id: string
    recruitmentListId: string
    createdAt: string
    createdBy: string
    fileName: string
    fileType: string
    status: string
    filterInfo: string
}