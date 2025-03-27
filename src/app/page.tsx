import { PublicNav } from '@/components/public-nav'
import { Button } from '@/components/ui/button'
import { Play } from "lucide-react"
import Image from 'next/image'
import landingImage from "../images/desk_light.png"

export default async function Home() {
    return (
        <div className="min-h-screen bg-white">
            <PublicNav />
            <main>
                {/* Hero Section */}
                <section className="mx-auto  px-4 py-8 text-center sm:px-6 lg:px-8">
                    <h1 className="mx-auto text-4xl font-bold  text-gray-900 sm:text-5xl">
                        Assign Shifts With Ease and Confidence
                    </h1>
                    <p className="mx-auto mt-6  text-lg  sm:text-4xl">
                        Empower your team, streamline schedules, and cut admin work.
                    </p>
                    <p className="mx-auto mt-4 max-w-4xl text-base text-gray-600 sm:text-md">
                        At QlikShift, our intuitive platform streamlines shift assignments, ensuring that each team member is placed
                        where they&apos;re needed most, when they&apos;re needed most. No more tangled spreadsheets, last-minute
                        changes, or guesswork—just a clear, dynamic schedule that evolves as your business does
                    </p>

                    <div className="mt-10 flex items-center justify-center gap-4 text-white">
                        <Button className="bg-primary hover:bg-[#235536] rounded-[20px]" size="lg">
                            TRY FOR FREE
                        </Button>
                        <Button variant="secondary" size="lg" className="bg-[#625E5E] rounded-[20px]">
                            <Play className="mr-2 h-4 w-4" />
                            REQUEST DEMO
                        </Button>
                    </div>
                </section>

                {/* Dashboard Preview */}
                <section className="flex justify-center px-4 sm:px-6 lg:px-8">
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                        <Image src={landingImage} alt="Dashboard Preview" width={800} height={400} />
                    </div>
                </section>
            </main>
        </div>
    )
}

