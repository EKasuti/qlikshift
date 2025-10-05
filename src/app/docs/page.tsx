import { Button } from "@/components/ui/button";

export default function IntroPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Introduction</h1>
      <p className="text-gray-700 dark:text-gray-300">
        Welcome to QlikShift documentation! Here you’ll learn how to set up,
        schedule shifts, and manage teams.
      </p>

      {/* Prev / Next navigation */}
      <div className="flex justify-end mt-12">
        <Button>
          <a href="/docs/quickstart">QuickStart →</a>
        </Button>
      </div>
    </div>
  )
}