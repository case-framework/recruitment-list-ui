import RecruitmentListEditor from "@/components/recruitment-list-editor/recruitment-list-editor";
import { Card } from "@/components/ui/card";
import { hasCreateRecruitmentListPermission } from "@/lib/backend/permissions";
import { getRecruitmentList } from "@/lib/backend/recruitmentLists";
import { RecruitmentList } from "@/lib/backend/types";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

interface PageParams {
    searchParams?: Promise<{
        from?: string;
    }>
}

const toDuplicateDraft = (recruitmentList: RecruitmentList): RecruitmentList => ({
    id: undefined,
    name: `${recruitmentList.name} (Copy)`,
    description: recruitmentList.description,
    participantInclusion: recruitmentList.participantInclusion,
    exclusionConditions: recruitmentList.exclusionConditions,
    participantData: recruitmentList.participantData,
    customization: recruitmentList.customization,
    studyActions: recruitmentList.studyActions,
});

export default async function Page(props: PageParams) {
    const allowedToCreateRecruitmentList = await hasCreateRecruitmentListPermission();
    if (!allowedToCreateRecruitmentList) {
        redirect('/home');
    }

    const sourceListId = (await props.searchParams)?.from;

    let initialValues: RecruitmentList | undefined = undefined;
    let duplicateSourceName: string | undefined = undefined;
    if (sourceListId !== undefined) {
        const sourceListResp = await getRecruitmentList(sourceListId);
        if (sourceListResp.error !== undefined) {
            redirect('/home');
        }

        duplicateSourceName = sourceListResp.name;
        initialValues = toDuplicateDraft(sourceListResp);
    }

    return (
        <div className="lg:container mx-auto p-4">
            <Card className="p-6 max-h-full overflow-y-auto">
                <h1 className="text-2xl font-bold mb-4">
                    {initialValues === undefined ? 'Create a new recruitment list' : 'Duplicate recruitment list'}
                </h1>
                {duplicateSourceName !== undefined && (
                    <p className="text-muted-foreground mb-4">
                        Duplicating settings from <span className="font-medium text-foreground">{duplicateSourceName}</span>.
                    </p>
                )}
                <RecruitmentListEditor recruitmentList={initialValues} />
            </Card>
        </div>
    );
}
