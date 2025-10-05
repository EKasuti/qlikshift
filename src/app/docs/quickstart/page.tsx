import { Button } from "@/components/ui/button"

export default function Quickstart() {
  const steps = [
    {
      title: "Clone the repo",
      code: `git clone https://github.com/EKasuti/qlikshift-backend-migration.git
cd qlikshift-backend-migration`,
    },
    {
      title: "Install dependencies",
      code: `npm install`,
    },
    {
      title: "Start MariaDB with Docker",
      code: `docker compose up -d`,
    },
    {
      title: "Create a .env file",
      code: `touch .env`,
    },
    {
      title: "Run initial migration",
      code: `DATABASE_URL=$MIGRATION_DATABASE_URL npx prisma migrate dev --name init`,
    },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Quickstart</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Get QlikShift backend running locally in just a few steps.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((step, i) => (
          <div key={i} className="mb-6">
            <h2 className="text-xl font-semibold mb-3">{step.title}</h2>
            <pre className="bg-gray-100 dark:bg-gray-900 px-5 py-4 rounded-lg overflow-x-auto text-sm font-mono leading-relaxed border border-gray-300 dark:border-gray-700">
              <code>{step.code}</code>
            </pre>
          </div>
        ))}
      </div>

      {/* Prev / Next navigation */}
      <div className="flex justify-between mt-12">
        <Button variant="outline">
          <a href="/docs">← Introduction</a>
        </Button>
        <Button>
          <a href="/docs/installation">Installation →</a>
        </Button>
      </div>
    </div>
  )
}
