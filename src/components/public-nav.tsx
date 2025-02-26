import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import logoImage from "../images/logo.png"

export function PublicNav() {
    return (
        <nav>
            <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 my-2">
                {/* Left - Logo & Name */}
                <div className="flex items-center gap-2">
                    <Image src={logoImage} alt="QlikShift Logo" width={30} height={30} />
                    <span className="text-xl font-semibold">QlikShift</span>
                </div>

                <div className="hidden items-center gap-6 sm:flex border border-gray-200 rounded-[20px] px-4 py-2">
                    <Link href="#" className="text-sm font-bold hover:text-gray-600 text-primary">
                        Home
                    </Link>
                    <Link href="#" className="text-sm font-medium hover:text-gray-600 text-gray-900">
                        Features
                    </Link>
                    <Link href="#" className="text-sm font-medium hover:text-gray-600 text-gray-900">
                        Pricing
                    </Link>
                    <Link href="#" className="text-sm font-medium hover:text-gray-600 text-gray-900">
                        Contact
                    </Link>
                </div>

                <Link href="/dashboard">
                    <Button className="bg-primary text-white rounded-[20px]">
                        Get Started
                    </Button>
                </Link>
            </div>
        </nav>
    )
}

