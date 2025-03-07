import ErrorAlert from "@/components/error-alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getResearchers } from "@/lib/backend/researchers";
import { ResearcherUser } from "@/lib/backend/types";
import Link from "next/link";
import { format } from 'date-fns'
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Page() {
    const session = await auth();
    if (!session || !session.user) {
        redirect('/auth/login');
    }

    const resp = await getResearchers();
    const researchers = resp.researchers;
    if (resp.error !== undefined || researchers === undefined) {
        return (
            <div className="h-full flex items-center justify-center">
                <ErrorAlert
                    title="Failed to load researchers"
                    description={`${resp.status} - ${resp.error}`}
                />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-semibold tracking-wider flex flex-col sm:flex-row gap-6 items-end">
                <span className="text-primary grow">
                    Researcher Users
                </span>
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {researchers.map((user: ResearcherUser) => (
                    <Link
                        key={user.id}
                        href={`/home/user-management/${user.id}`}
                        prefetch={false}
                    >
                        <Card
                            className="cursor-pointer hover:bg-neutral-50 transition-shadow p-4"

                        >
                            <div className="">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={user.imageUrl} alt={user.username} />
                                        <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="text-xl font-semibold">{user.username}

                                            {user.sub === session.user?.sub && <span className="text-sm text-muted-foreground"> (You)</span>}
                                        </h2>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex mt-4 justify-between w-full">
                                <Badge variant={user.isAdmin ? "default" : "secondary"}>
                                    {user.isAdmin ? "Admin" : "User"}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    Last active: {format(new Date(user.lastLoginAt), 'dd.MMM.yyyy HH:mm')}
                                </span>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
