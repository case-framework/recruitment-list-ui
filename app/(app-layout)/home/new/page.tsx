import RecruitmentListEditor from "@/components/recruitment-list-editor/recruitment-list-editor";
import { Card } from "@/components/ui/card";
import { hasCreateRecruitmentListPermission } from "@/lib/backend/permissions";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function Page() {
    const allowedToCreateRecruitmentList = await hasCreateRecruitmentListPermission();
    if (!allowedToCreateRecruitmentList) {
        redirect('/home');
    }


    return (
        <div className="lg:container mx-auto p-4">
            <Card className="p-6 max-h-full overflow-y-auto">
                <h1 className="text-2xl font-bold mb-4">
                    Create a new recruitment list
                </h1>
                <RecruitmentListEditor />
            </Card>
        </div>
    );
}
