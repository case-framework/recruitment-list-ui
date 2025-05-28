'use client'

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Import, Settings, Users, RefreshCw, Trash, Play } from "lucide-react"

export default function SettingsNav({
    hasDeleteAccess
}: {
    hasDeleteAccess: boolean
}) {
    const { id } = useParams()
    const pathname = usePathname()

    const navItems = [
        { href: `/home/${id}/settings/import`, icon: Import, label: "Import Participants" },
        { href: `/home/${id}/settings/configs`, icon: Settings, label: "Configs" },
        { href: `/home/${id}/settings/study-actions`, icon: Play, label: "Study Actions" },
        { href: `/home/${id}/settings/permissions`, icon: Users, label: "Permissions" },
        { href: `/home/${id}/settings/sync`, icon: RefreshCw, label: "Sync Info" },
    ]

    if (hasDeleteAccess) {
        navItems.push({ href: `/home/${id}/settings/delete`, icon: Trash, label: "Delete Recruitment List" })
    }

    return (
        <nav className="flex flex-col space-y-2 w-64 px-4 py-1 bg-neutral-50 border-r border-border">
            <h2 className="text-lg font-bold px-4 mb-2 pt-4">Settings</h2>
            {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                    <Button
                        variant={pathname === item.href ? "secondary" : "ghost"}
                        className={`w-full justify-start`}
                    >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                    </Button>
                </Link>
            ))}
        </nav>
    )
}