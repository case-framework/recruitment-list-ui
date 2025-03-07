
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import UserEditor from "./_components/user-editor";
import { getResearcher } from "@/lib/backend/researchers";
import ErrorAlert from "@/components/error-alert";
import { getUserPermissions } from "@/lib/backend/permissions";
import { getRecruitmentLists } from "@/lib/backend/recruitmentLists";

interface UserPageParams {
    params: {
        userId: string;
    }

}

export default async function Page(props: UserPageParams) {

    const [user, permResponse, rlResp] = await Promise.all([
        getResearcher(props.params.userId),
        getUserPermissions(props.params.userId),
        getRecruitmentLists(),
    ]);

    if (user.error !== undefined || permResponse.error !== undefined || rlResp.error !== undefined) {
        return (
            <div className="h-full p-6 flex flex-col">
                <div>
                    <Button
                        variant="outline"
                        asChild
                    >
                        <Link href="/home/user-management">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Users
                        </Link>
                    </Button>
                </div>
                <div className="flex items-center justify-center grow">
                    <ErrorAlert
                        title="Failed to load data"
                        description={`user error: ${user.error}, permissions error: ${permResponse.error}, recruitment lists error: ${rlResp.error}`}
                    />
                </div>
            </div>
        );
    }

    const permissions = permResponse.permissions || [];
    const recruitmentLists = rlResp.recruitmentLists || [];

    return (
        <div className="p-6 space-y-6">
            <Button
                variant="outline"
                asChild
            >
                <Link href="/home/user-management">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Users
                </Link>
            </Button>
            <UserEditor
                user={user}
                permissions={permissions}
                recruitmentLists={recruitmentLists}
            />
        </div>
    );
}
