'use client'
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarButtonProps {
    icon: React.ReactNode;
    label: string;
    disabled?: boolean;
    href: string;
}

const SideBarButton: React.FC<SidebarButtonProps> = (props) => {
    const pathname = usePathname();

    return (<Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
            <Button
                variant={pathname === props.href ? "default" : "ghost"}
                size="icon"
                className="rounded-lg"
                aria-label={props.label}
                asChild
                disabled={props.disabled}
            >
                <Link
                    href={props.disabled ? '/home' : props.href}
                >
                    {props.icon}
                </Link>
            </Button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={5}>
            {props.label}
        </TooltipContent>
    </Tooltip>
    );
};

export default SideBarButton;