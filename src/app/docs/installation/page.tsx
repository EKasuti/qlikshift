import { Button } from "@/components/ui/button";

export default function Installation() {
    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Installation</h1>
            <p className="text-gray-700 dark:text-gray-300">
                Installation
            </p>

            {/* Prev / Next navigation */}
            <div className="flex justify-between mt-12">
                <Button variant="outline">
                    <a href="/docs/quickstart">← QuickStart</a>
                </Button>
                <Button>
                    <a href="/docs/api">APIs →</a>
                </Button>
            </div>
        </div>
    )
}