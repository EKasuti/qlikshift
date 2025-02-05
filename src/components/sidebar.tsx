"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, MonitorDot, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import logoImage from "../images/logo_light.png"

const navItems = [
    { title: "Home", href: "/dashboard", icon: Home },
    { title: "Students", href: "/dashboard/students", icon: Users },
    { title: "Desks", href: "/dashboard/desks", icon: MonitorDot },
    { title: "Assign", href: "/dashboard/assign", icon: ClipboardList }
]

export function SideBar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full w-[80px] flex-col border-r bg-black">
            {/* Logo Image */}
            <div className="flex h-[60px] items-center justify-center bg-primary">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Image src={logoImage} alt="QlikShift Logo" width={40} height={40} />
                </Link>
            </div>

            {/* Sidebar Items */}
            <nav className="flex flex-1 flex-col">
                <ul className="flex flex-1 flex-col ">
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={cn(
                                    "flex flex-col h-[60px] w-full items-center justify-center transition ",
                                    pathname === item.href
                                        ? "bg-white text-black font-bold"
                                        : "bg-black text-white"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="text-xs mt-1">{item.title}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    )
}
