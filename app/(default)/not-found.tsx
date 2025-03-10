import { Button } from "@/components/ui/button";
import { OctagonXIcon } from "lucide-react";
import Link from "next/link";


export default function NotFound() {

    return <div className="flex flex-col justify-center gap-4">
        <p className="text-muted-foreground flex items-center gap-2">
            <OctagonXIcon />
            The requested page does not exist</p>
        <Button
            asChild
            variant={'secondary'}
        >
            <Link
                href={'/'}
            >
                Start over
            </Link>
        </Button>
    </div>
}