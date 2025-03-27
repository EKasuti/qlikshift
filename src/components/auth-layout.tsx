import type React from "react"
import logoImage from "../images/logo.png"
import Image from "next/image"
import Link from "next/link"

interface AuthLayoutProps {
  children: React.ReactNode
  heading: string
  subheading?: string
}

export function AuthLayout({ children, heading, subheading }: AuthLayoutProps) {
    return ( 
        <div className="min-h-screen w-full py-6 md:py-16">
             <div className="border-b border-gray-600 bg-black mb-10">
                <Link href="/">
                    <div className="absolute left-4 top-4 bg-white rounded-lg p-1 px-4 cursor-pointer border border-gray-300 hover:bg-gray-100">
                        <span className="text-sm text-black">Return to Home</span>
                    </div>
                </Link>
            </div>
     
            <div className=" flex items-center justify-center mt-4">
                <div className="mx-auto w-full max-w-[400px] overflow-hidden rounded-lg border  p-8">
                    <div className="mb-8 text-center items-center">
                        <div className="flex items-center justify-center gap-2">
                            <Image src={logoImage} alt="QlikShift Logo" width={30} height={30} />
                            <span className="text-xl font-semibold">QlikShift</span>
                        </div>
                            <h1 className="mt-6 text-2xl font-semibold">{heading}</h1>
                            {subheading && <p className="mt-2 text-muted-foreground">{subheading}</p>}
                        </div>
                    {children}
                </div>
            </div>
        </div>
    )
}

