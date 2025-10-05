"use client";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/components/auth-layout"
import { useState } from "react"
import { Login } from "@/apis/authApis";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await Login(email, password);

            router.push("/dashboard");
        } catch (error) {
            console.error("Login error:", error);
            setPassword("");
            setError("Invalid credentials. Please try again.");
            throw error;
        } finally {
            setLoading(false);
        }
    }
    return (
        <AuthLayout heading="Login to your account" subheading="Assign shifts with ease & confidence">
            <form className="space-y-2" onSubmit={handleLogin}>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="text" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div>
                    <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white mt-4">
                        {loading ? "Logging in..." : "Login"}
                    </Button>
                </div>

                {error && <p className="text-red-500">{error}</p>}

                {/* Demo Login Credentials */}
                <div className="mt-6 text-center">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            setEmail("test@gmail.com");
                            setPassword("testPass123$");
                        }}
                    >
                        Use Demo Credentials
                    </Button>
                </div>
            </form>

            <div className="mt-6 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-emerald-700 hover:underline ">
                    Sign Up
                </Link>
            </div>
        </AuthLayout>
    )
}

