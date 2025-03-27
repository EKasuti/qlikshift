import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/components/auth-layout"

export default function SignupPage() {
    // Will add signup logic later
    return (
        <AuthLayout heading="Create a new account" subheading="Assign shifts with ease & confidence">
            <form className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required autoComplete="email" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required autoComplete="new-password" />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-emerald-800 text-white">
                    Create Account
                </Button>
            </form>
            <div className="mt-6 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-emerald-700 hover:underline ">
                    Log In
                </Link>
            </div>
        </AuthLayout>
    )
}

