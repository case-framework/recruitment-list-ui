import CreateRecruitmentListForm from "@/components/features/recruitment-lists/create-recruitment-list-form";
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
        <div className="flex h-full items-center justify-center p-4">
            <Card className="w-full max-w-3xl p-6 max-h-full overflow-y-auto">
                <h1 className="text-2xl font-bold mb-4">Create a new recruitment list</h1>
                <CreateRecruitmentListForm />
            </Card>
        </div>
    );
}
