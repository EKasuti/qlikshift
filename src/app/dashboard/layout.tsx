import type React from "react";
import { Search } from "@/components/search";
import { UserNav } from "@/components/user-nav";
import { SideBar } from "@/components/sidebar";
import { IsAdmin } from "@/components/isAdmin";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen">
            <SideBar />

            <div className="flex flex-1 flex-col">
                <IsAdmin />
                <header className="flex h-[60px] items-center gap-4 border-b bg-white px-4">
                    {/* Search Bar */}
                    <Search />

                    {/* User */}
                    <div className="ml-auto">
                        <UserNav />
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-4">{children}</main>
            </div>
        </div>
  );
}
