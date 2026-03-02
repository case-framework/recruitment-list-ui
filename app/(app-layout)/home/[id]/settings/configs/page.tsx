import RecruitmentListEditor from "@/components/recruitment-list-editor/recruitment-list-editor";
import { RecruitmentList } from "@/lib/backend/types";
import { getAvailableRecruitmentListTags, getRecruitmentList } from "@/lib/backend/recruitmentLists";
import { redirect } from "next/navigation";

interface PageParams {
    params: Promise<{
        id: string;
    }>
}

type RecruitmentListWithTags = RecruitmentList & { tags?: unknown };

const collator = new Intl.Collator(undefined, { sensitivity: "base" });

const normalizeTags = (rawTags: unknown) => {
    if (!Array.isArray(rawTags)) {
        return [];
    }

    const cleanedTags = rawTags
        .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
        .filter((tag): tag is string => tag.length > 0);

    return Array.from(new Set(cleanedTags)).sort((a, b) => collator.compare(a, b));
};

export default async function Page(props: PageParams) {
    const { id } = await props.params;

    const rlResp = await getRecruitmentList(id);
    const availableTagsResp = await getAvailableRecruitmentListTags();
    if (rlResp.error !== undefined) {
        redirect('/home');
    }
    const initialTags = normalizeTags((rlResp as RecruitmentListWithTags).tags);
    const availableTags = availableTagsResp.error !== undefined
        ? []
        : normalizeTags(availableTagsResp.tags);

    return (
        <div className="space-y-6 pb-12">
            <div>
                <h1 className="text-2xl font-bold">Configs</h1>
                <p className="text-sm text-muted-foreground">
                    Configure recruitment list settings, inclusion criteria, participant data, and custom values.
                </p>
            </div>

            <RecruitmentListEditor
                recruitmentList={rlResp}
                availableTags={availableTags}
                initialTags={initialTags}
            />
        </div>

    );
}
