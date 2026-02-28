import { z } from "zod";
import { RecruitmentList, recruitmentListSchema } from "./backend/types";

export const RUI_CONFIG_EXTENSION = ".crl";
export const RUI_CONFIG_FORMAT = "rui-config";
export const RUI_CONFIG_VERSION = 1;

const portableRecruitmentListSchema = recruitmentListSchema.omit({
    id: true,
    createdAt: true,
    createdBy: true,
});

export type PortableRecruitmentListConfig = z.infer<typeof portableRecruitmentListSchema>;

export const ruiConfigMetadataSchema = z.object({
    format: z.literal(RUI_CONFIG_FORMAT),
    version: z.literal(RUI_CONFIG_VERSION),
    exportedAt: z.string().datetime(),
    source: z.object({
        recruitmentListId: z.string().optional(),
        recruitmentListName: z.string().optional(),
        host: z.string().optional(),
    }).optional(),
});

const ruiConfigEnvelopeSchema = z.object({
    metadata: ruiConfigMetadataSchema,
    config: z.unknown(),
});

export type RuiConfigPackage = {
    metadata: z.infer<typeof ruiConfigMetadataSchema>;
    config: PortableRecruitmentListConfig;
}

const getPortableConfig = (recruitmentList: RecruitmentList): PortableRecruitmentListConfig => {
    const normalizedConfig = normalizeResearchDataDateValues({
        name: recruitmentList.name,
        description: recruitmentList.description,
        tags: recruitmentList.tags,
        participantInclusion: recruitmentList.participantInclusion,
        exclusionConditions: recruitmentList.exclusionConditions,
        participantData: recruitmentList.participantData,
        customization: recruitmentList.customization,
        studyActions: recruitmentList.studyActions,
    });

    return portableRecruitmentListSchema.parse(normalizedConfig);
}

function normalizeResearchDataDateValues(config: unknown): unknown {
    if (config === null || typeof config !== "object") {
        return config;
    }

    const configRecord = config as {
        participantData?: {
            researchData?: Array<{
                startDate?: Date | string;
                endDate?: Date | string;
            }>
        }
    };

    const researchData = configRecord.participantData?.researchData;
    if (!Array.isArray(researchData)) {
        return config;
    }

    const normalizedResearchData = researchData.map((entry) => ({
        ...entry,
        startDate: typeof entry.startDate === "string" ? new Date(entry.startDate) : entry.startDate,
        endDate: typeof entry.endDate === "string" ? new Date(entry.endDate) : entry.endDate,
    }));

    return {
        ...configRecord,
        participantData: {
            ...configRecord.participantData,
            researchData: normalizedResearchData,
        }
    };
}

export const createRuiConfigPackage = (
    recruitmentList: RecruitmentList,
    source?: z.infer<typeof ruiConfigMetadataSchema.shape.source>
): RuiConfigPackage => {
    const config = getPortableConfig(recruitmentList);
    return {
        metadata: {
            format: RUI_CONFIG_FORMAT,
            version: RUI_CONFIG_VERSION,
            exportedAt: new Date().toISOString(),
            source,
        },
        config,
    };
}

export const parseRuiConfigPackage = (input: unknown): {
    data?: RuiConfigPackage;
    error?: string;
} => {
    const envelope = ruiConfigEnvelopeSchema.safeParse(input);
    if (!envelope.success) {
        return {
            error: envelope.error.issues[0]?.message || "Invalid configuration envelope.",
        };
    }

    const normalizedConfig = normalizeResearchDataDateValues(envelope.data.config);
    const config = portableRecruitmentListSchema.safeParse(normalizedConfig);
    if (!config.success) {
        return {
            error: config.error.issues[0]?.message || "Invalid recruitment list configuration.",
        };
    }

    return {
        data: {
            metadata: envelope.data.metadata,
            config: config.data,
        }
    };
}
