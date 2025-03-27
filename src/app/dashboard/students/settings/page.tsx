import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function StudentsSettingsPage() {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
            <Tabs defaultValue="settings" className="w-fit">
                <TabsList>
                    <Link href="/dashboard/students">
                        <TabsTrigger value="overview" 
                            className=" data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:uppercase">Overview</TabsTrigger>
                    </Link>
                    <Link href="/dashboard/students/settings">
                        <TabsTrigger value="settings"
                        className=" data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:uppercase"
                        >Settings</TabsTrigger>
                    </Link>
                </TabsList>
            </Tabs>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-gray-200" />

        <div className="m-4"> Students Settings Page</div>

      </div>
    )
  }
  
  