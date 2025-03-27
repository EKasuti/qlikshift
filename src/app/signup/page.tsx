"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/components/auth-layout"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Login, SignUp } from "@/apis/authApis"

export default function SignupPage() {
    // Will add signup logic later
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Create a new user
            await SignUp(email, password);

            // Login the user
            await Login(email, password);

            // Redirect to the dashboard
            router.push("/dashboard");
        } catch (error) {
            setError((error as Error).message);
            console.error("Signup error:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout heading="Create a new account" subheading="Assign shifts with ease & confidence">
            <form className="space-y-6" onSubmit={handleSignUp}>
                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="email" > Email </Label>
                    <Input 
                        id="email" 
                        type="email" 
                        placeholder="Enter your email" 
                        required className="bg-white" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                 {/* Password */}
                <div className="space-y-2">
                    <Label htmlFor="password"> Password </Label>
                    <Input 
                        id="password" 
                        type="password" 
                        placeholder="Enter your password" 
                        required className="bg-white"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {/* Error message */}
                {error && 
                    <p className="text-red-500 text-sm text-center">{error}</p>
                }

                {/* Login Button */}
                <div className="flex justify-center">
                    <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
                        {loading ? "Creating account..." : "Sign Up"}
                    </Button>
                </div>
                
                 {/* Signup Option */}
                 <div className="flex justify-center gap-4 items-center text-sm">
                    <p>Already have an account?</p>
                    <Link href="/login" className="text-primary">Login</Link>
                </div>
            </form>
        </AuthLayout>
    )
}

