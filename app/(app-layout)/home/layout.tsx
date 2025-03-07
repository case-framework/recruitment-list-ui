import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "./_components/sidebar";
import { Toaster } from "@/components/ui/sonner";

export const dynamic = 'force-dynamic';

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <TooltipProvider>
            <Sidebar />
            <div className="pl-[56px] h-full">
                {children}
            </div>
            <Toaster />
        </TooltipProvider >
    );
}
