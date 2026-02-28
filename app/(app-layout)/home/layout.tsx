import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "./_components/sidebar";

export const dynamic = 'force-dynamic';

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <TooltipProvider>
            <Sidebar />
            <div className="pl-[53px] h-full">
                {children}
            </div>
        </TooltipProvider >
    );
}
