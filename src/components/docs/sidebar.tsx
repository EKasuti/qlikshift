"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CardContent, QlikCard } from "../ui/card"

const docsNav = [
  { section: "Getting Started", links: [
    { href: "/docs", label: "Introduction" },
    { href: "/docs/quickstart", label: "Quickstart" },
    { href: "/docs/installation", label: "Installation" },
    { href: "/docs/api", label: "APIs" },
  ]}
]

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <QlikCard className="rounded-r-none">
      <CardContent className="space-y-4 w-64 p-6 lg:block h-[calc(100vh-4rem)]">
        {docsNav.map((group) => (
          <div key={group.section}>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">{group.section}</h4>
            <ul className="space-y-1">
              {group.links.map((link) => {
                const active = pathname === link.href
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`block rounded-md px-3 py-2 text-sm transition ${
                        active
                          ? "bg-gray-200 text-primary font-medium"
                          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-black hover:bg-gray-100"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </CardContent>  
    </QlikCard>
  )
}
