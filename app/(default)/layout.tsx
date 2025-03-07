import { Toaster } from "sonner";
import { ArrowUpRight } from "lucide-react";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <div className="min-h-screen flex flex-col justify-between">
            <main className="container mx-auto px-4 py-8 grow flex items-center justify-center">
                {children}
            </main>
            <Toaster />
            <footer className="bg-secondary py-4 border-t border-border">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm text-secondary-foreground">
                        © 2024 Researcher Interface. Created by{' '}
                        <a
                            href="https://coneno.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                            coneno
                            <span>
                                <ArrowUpRight className="size-3" />
                            </span>
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
