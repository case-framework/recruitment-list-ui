
import RecruitmentLists from "@/components/features/recruitment-lists/recruitment-lists";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { hasCreateRecruitmentListPermission } from "@/lib/backend/permissions";
import { PlusCircle } from "lucide-react";
import Link from "next/link";


export const dynamic = 'force-dynamic';

export default async function Page() {
    const allowedToCreateRecruitmentList = await hasCreateRecruitmentListPermission();

    return (
        <div className="flex items-start justify-center h-full p-2 lg:py-[53px]">
            <Card className="max-w-4xl w-full p-4 max-h-full overflow-y-auto">
                <div className="flex justify-between items-end mb-6 gap-8">
                    <div className="space-y-1">
                        <h1 className="text-xl font-bold">Recruitment Lists</h1>
                        <p className="text-muted-foreground text-sm">
                            Select a recruitment list to view the participants and responses.
                        </p>
                    </div>
                    {allowedToCreateRecruitmentList && <Button
                        variant={'secondary'}
                        asChild
                    >
                        <Link href="/home/new">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Recruitment List
                        </Link>
                    </Button>}
                </div>
                <RecruitmentLists />
            </Card >
        </div>
    );
}
