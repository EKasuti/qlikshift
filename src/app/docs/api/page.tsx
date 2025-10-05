import { Button } from "@/components/ui/button";

export default function ApiDocs() {
    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">APIs</h1>
            <p className="text-gray-700 dark:text-gray-300">
                APIs
            </p>

             {/* Prev / Next navigation */}
            <div className="flex justify-between mt-12">
                <Button variant="outline">
                    <a href="/docs/installation">← Installation</a>
                </Button>
                <Button>
                    <a href="/dashboard">Get Started →</a>
                </Button>
            </div>
        </div>
    )
}