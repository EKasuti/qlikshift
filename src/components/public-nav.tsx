"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { MousePointerClick, Menu, X } from "lucide-react"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Documentation" },
]

export function PublicNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto flex h-16 bg-white dark:bg-dark-theme border border-black dark:border-dark-border rounded-none md:rounded-[12px] items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
        {/* Left - Logo & Name */}
        <div className="flex items-center gap-2">
          <MousePointerClick className="h-6 w-6 text-accent" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            QlikShift
          </h1>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden sm:flex items-center space-x-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm px-2 rounded-[4px] transition-all ${
                  isActive
                    ? "font-bold text-primary scale-110"
                    : "font-medium hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Right Side - Theme + CTA + Mobile Menu */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* Desktop CTA */}
          <Link href="/dashboard" className="hidden sm:block">
            <Button variant="cta">Get Started →</Button>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="sm:hidden mt-2 mx-2 bg-white dark:bg-dark-theme border border-gray-300 dark:border-gray-700 rounded-[12px] shadow-md p-4 space-y-3 transition-all">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block text-sm px-2 py-1 rounded-[6px] ${
                  isActive
                    ? "font-semibold text-primary"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {link.label}
              </Link>
            )
          })}

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <Link href="/dashboard" onClick={() => setIsOpen(false)}>
              <Button variant="cta" className="w-full">
                Get Started →
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
