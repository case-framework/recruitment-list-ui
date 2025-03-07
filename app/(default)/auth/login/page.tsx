import { BuildingIcon } from "lucide-react";
import PconderzoekLogoCard from "../../_components/pconderzoek-logo-card";
import LoginClient from "./_components/login-client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Page({
    searchParams
}: {
    searchParams: {
        redirectTo?: string;
    };
}) {
    const session = await auth();
    if (session && session.user) {
        let redirectTo = searchParams.redirectTo || '/';
        if (redirectTo.startsWith('http')) {
            redirectTo = '/home';
        }
        redirect(redirectTo)
    }

    return (
        <PconderzoekLogoCard>
            <div className="space-y-6">
                <div className="text-center">
                    <BuildingIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h2 className="mt-2 text-lg font-medium">Institutional Login Required</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Please log in using your institutional credentials to access the Recruitment List App.
                    </p>
                </div>

                <div>
                    <LoginClient />
                </div>
            </div>
        </PconderzoekLogoCard>

    );
}
