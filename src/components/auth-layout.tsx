import type React from "react"
import Link from "next/link"
import { MousePointerClick } from "lucide-react"
import { Button } from "./ui/button"

interface AuthLayoutProps {
  children: React.ReactNode
  heading: string
  subheading?: string
}

export function AuthLayout({ children, heading, subheading }: AuthLayoutProps) {
    return ( 
        <div className="min-h-screen w-full bg-primary dark:bg-dark-theme/60">
             <div className="border-b border-gray-200 dark:border-dark-border">
                <Link href="/">
                    <div className="p-2">
                        <Button variant="outline" className="bg-white dark:bg-dark-theme">
                            Return to Home
                        </Button>
                    </div>
                </Link>
            </div>
     
            <div className=" flex items-center justify-center px-4 sm:px-6 lg:px-8 mt-8 md:mt-12">
                <div className="mx-auto w-full max-w-[400px] overflow-hidden rounded-lg border dark:border-dark-border bg-white dark:bg-dark-theme p-8">
                    <div className="mb-8 text-center items-center">
                        {/* Left - Logo & Name */}
                        <div className="flex items-center justify-center gap-2">
                            <MousePointerClick className="h-6 w-6" />
                            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                                QlikShift
                            </h1>
                        </div>
                        <h1 className="mt-4 text-2xl font-semibold">{heading}</h1>
                        {subheading && <p className="mt-2 text-muted-foreground">{subheading}</p>}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    )
}

