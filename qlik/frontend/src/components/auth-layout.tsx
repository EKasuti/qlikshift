import type React from "react"
import logoImage from "../images/logo.png"
import Image from "next/image"

interface AuthLayoutProps {
  children: React.ReactNode
  heading: string
  subheading?: string
}

export function AuthLayout({ children, heading, subheading }: AuthLayoutProps) {
    return ( 
        <div className="min-h-screen w-full py-6 md:py-16">
            <div className="border border-gray-200 bg-black">
                <div className="flex items-center gap-2 absolute left-4 top-4">
                    <Image src={logoImage} alt="QlikShift Logo" width={30} height={30} />
                    <span className="text-xl font-semibold">QlikShift</span>
                </div>
            </div>
     
            <div className=" flex items-center justify-center mt-4">
                <div className="mx-auto w-full max-w-[400px] overflow-hidden rounded-lg border  p-8">
                    <div className="mb-8 text-center items-center">
                        <div className="flex items-center gap-2">
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

