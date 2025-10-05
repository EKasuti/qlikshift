import type React from "react"
import Link from "next/link"
import { MousePointerClick } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
  heading: string
  subheading?: string
}

export function AuthLayout({ children, heading, subheading }: AuthLayoutProps) {
    return ( 
        <div className="min-h-screen w-full py-6 md:py-16 bg-gray-200">
             <div className="border-b border-gray-300 mb-10">
                <Link href="/">
                    <div className="absolute left-4 top-4 bg-white rounded-lg p-1 px-4 cursor-pointer border border-gray-300 hover:bg-gray-100">
                        <span className="text-sm text-black">Return to Home</span>
                    </div>
                </Link>
            </div>
     
            <div className=" flex items-center justify-center mt-4">
                <div className="mx-auto w-full max-w-[400px] overflow-hidden rounded-lg border bg-white p-8">
                    <div className="mb-8 text-center items-center">
                        {/* Left - Logo & Name */}
                        <div className="flex items-center justify-center gap-2">
                            <MousePointerClick className="h-6 w-6 text-accent" />
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

