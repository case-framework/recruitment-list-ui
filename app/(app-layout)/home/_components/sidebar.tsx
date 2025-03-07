import { Button } from '@/components/ui/button';
import { HomeIcon, UserCog } from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import UserButton from './user-button';
import { Separator } from '@/components/ui/separator';
import SideBarButton from './sidebar-button';
import { auth } from '@/auth';
import SidebarNav from './sidebar-nav';


const Sidebar: React.FC = async () => {
    const session = await auth();
    const isAdmin = session?.isAdmin;

    return (
        <aside className="inset-y fixed  left-0 z-20 flex h-full flex-col border-r bg-background ">
            <div className="border-b p-2">
                <Button
                    variant="outline"
                    size="icon"
                    aria-label="Home"
                    className='hover:bg-secondary'
                    asChild
                >
                    <Link href="/home">
                        <HomeIcon />
                    </Link>
                </Button>
            </div>

            <SidebarNav />

            <nav className="mt-auto grid gap-1 p-2">
                {isAdmin && <SideBarButton
                    icon={<UserCog className="size-5" />}
                    label="User Management"
                    href="/home/user-management"
                />}
                <Separator />
                <UserButton />
            </nav>
        </aside>
    );
};

export default Sidebar;
