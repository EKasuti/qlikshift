import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type StatCardData = {
    title: string
    value: number
    icon: LucideIcon
    color: "purple" | "blue" | "orange" | "green"
}

const colorMap = {
    purple: "bg-stats-purple",
    blue: "bg-stats-blue",
    orange: "bg-stats-orange",
    green: "bg-stats-green"
} as const

const iconColorMap = {
    purple: "text-purple-500",
    blue: "text-blue-500",
    orange: "text-orange-500",
    green: "text-green-500"
} as const

export function StatsCards({ stats }: { stats: StatCardData[] }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon
                return (
                    <Card key={stat.title} className={colorMap[stat.color]}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                            <Icon className={`h-6 w-6 ${iconColorMap[stat.color]}`} />
                        </CardHeader>
                        <CardContent >
                            <div className="text-3xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
} 