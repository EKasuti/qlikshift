"use client"

import { DocsSidebar } from "@/components/docs/sidebar"
import { PublicNav } from "@/components/public-nav"
import { QlikCard } from "@/components/ui/card"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-black dark:bg-dark-background">
      {/* Top Nav */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <PublicNav />
        </div>
      </div>

      {/* Sidebar + Content */}
      <div className="flex flex-1 pt-16 relative">
        {/* Sidebar */}
        <aside
          className={`
            fixed top-16 bottom-0 z-40 bg-black
            transition-transform duration-300 ease-in-out
            w-64 transform
            lg:translate-x-0
            -translate-x-full
          `}
        >
          <DocsSidebar />
        </aside>

        {/* Main docs content */}
        <main
          className="
            flex-1
            lg:ml-64
            h-[calc(100vh-4rem)]
            overflow-y-auto
            transition-all
          "
        >
          <QlikCard className="h-full flex flex-col rounded-none md:rounded-[12px] lg:rounded-l-none lg:rounded-br-[52px]">
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              {children}
            </div>
          </QlikCard>
        </main>
      </div>
    </div>
  )
}
