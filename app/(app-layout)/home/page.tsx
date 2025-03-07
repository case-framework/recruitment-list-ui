
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasCreateRecruitmentListPermission } from "@/lib/backend/permissions";
import { getRecruitmentLists } from "@/lib/backend/recruitmentLists";
import { RecruitmentListInfo } from "@/lib/backend/types";
import { ChevronRight, PlusCircle } from "lucide-react";
import Link from "next/link";


export const dynamic = 'force-dynamic';

export default async function Page() {

    const allowedToCreateRecruitmentList = await hasCreateRecruitmentListPermission();


    const resp = await getRecruitmentLists();
    const lists = resp.recruitmentLists || [];

    return (
        <div className="flex items-center justify-center h-full py-6">
            <Card className="max-w-2xl p-4 max-h-full overflow-y-auto">
                <div className="text-muted-foreground text-center my-4">
                    Select a recruitment list to view the participants and responses.
                </div>
                <div className="flex justify-between items-end mb-6 gap-8">
                    <h1 className="text-xl font-bold">Recruitment Lists</h1>
                    {allowedToCreateRecruitmentList && <Button
                        variant={'secondary'}
                        asChild
                    >
                        <Link href="/home/new">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Recruitment List
                        </Link>
                    </Button>}
                </div>

                {lists.length === 0 ? (
                    <Card className="text-center p-4">
                        <p className="text-muted-foreground">
                            {"You don't have any recruitment lists yet."}
                        </p>

                    </Card>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {lists.map((list: RecruitmentListInfo) => (
                            <Link
                                key={list.id}
                                className=""
                                href={`/home/${list.id}`}
                            >
                                <Card
                                    className="hover:bg-neutral-50"
                                >
                                    <CardHeader className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="space-y-2 grow">
                                                <CardTitle className="text-lg">{list.name}</CardTitle>
                                                <CardDescription>{list.description}</CardDescription>
                                            </div>
                                            <div>
                                                <ChevronRight className="size-6 text-muted-foreground" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )
                }
            </Card >
        </div>
    );
}
