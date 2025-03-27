"use client";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/components/auth-layout"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        
        // Function to handle login logic
        try {
            const { error: supabaseError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (supabaseError) throw supabaseError;

            // API path: api/auth/login
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error);
            }

            // If successful navigate to dashboard
            window.location.href = "/dashboard";
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };
    return (
        <AuthLayout heading="Login to your account" subheading="Assign shifts with ease & confidence">
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="text" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
                    Login
                </Button>
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

