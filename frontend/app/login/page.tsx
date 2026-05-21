"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        setLoading(true);
        setMessage("");

        const result =
            mode === "login"
                ? await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                : await supabase.auth.signUp({
                    email,
                    password,
                });

        if (result.error) {
            setMessage(result.error.message);
            setLoading(false);
            return;
        }

        if (mode === "signup") {
            setMessage("Account created. Check your email if confirmation is required.");
        } else {
            window.location.href = "/";
        }

        setLoading(false);

        await supabase.from("profiles").upsert({
            id: result.data.user?.id,
            email,
            plan: "free",
        });
    }

    return (
        <main className="min-h-screen bg-black p-8 text-white">
            <div className="mx-auto max-w-md animate-fade">
                <Link
                    href="/"
                    className="button-secondary mb-8 inline-block rounded-xl px-4 py-2 text-sm"
                >
                    ← Back to App
                </Link>

                <div className="card-premium rounded-3xl p-6">
                    <p className="mb-3 text-sm text-zinc-500">
                        {mode === "login" ? "Welcome back" : "Create account"}
                    </p>

                    <h1 className="mb-6 text-3xl font-bold">
                        {mode === "login" ? "Login" : "Sign up"}
                    </h1>

                    <div className="space-y-4">
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            type="email"
                            className="input-premium w-full rounded-2xl p-4 text-white outline-none"
                        />

                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            type="password"
                            className="input-premium w-full rounded-2xl p-4 text-white outline-none"
                        />

                        <button
                            onClick={handleSubmit}
                            disabled={!email.trim() || !password.trim() || loading}
                            className="button-primary w-full rounded-2xl py-4 font-semibold disabled:opacity-50"
                        >
                            {loading
                                ? "Please wait..."
                                : mode === "login"
                                    ? "Login"
                                    : "Create account"}
                        </button>
                    </div>

                    {message && (
                        <p className="mt-4 rounded-2xl border border-zinc-800 bg-black p-3 text-sm text-zinc-400">
                            {message}
                        </p>
                    )}

                    <button
                        onClick={() => {
                            setMode(mode === "login" ? "signup" : "login");
                            setMessage("");
                        }}
                        className="mt-6 text-sm text-zinc-400 hover:text-white"
                    >
                        {mode === "login"
                            ? "Need an account? Sign up"
                            : "Already have an account? Login"}
                    </button>
                    {mode === "login" && (
                        <Link
                            href="/forgot-password"
                            className="mt-4 block text-sm text-zinc-400 hover:text-white"
                        >
                            Forgot password?
                        </Link>
                    )}

                </div>
            </div>
        </main>
    );
}