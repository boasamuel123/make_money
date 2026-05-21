"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    async function handleLogin() {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: "http://localhost:3000",
            },
        });

        if (error) {
            setMessage(error.message);
            return;
        }

        setMessage("Check your email for the login link.");
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-black p-8 text-white">
            <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
                <h1 className="mb-3 text-3xl font-bold">Login</h1>

                <p className="mb-6 text-zinc-400">
                    Enter your email to receive a magic login link.
                </p>

                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mb-4 w-full rounded-2xl border border-zinc-700 bg-black p-4 text-white outline-none"
                />

                <button
                    onClick={handleLogin}
                    disabled={!email.trim()}
                    className="w-full rounded-2xl bg-white py-4 font-semibold text-black disabled:opacity-50"
                >
                    Send login link
                </button>

                {message && <p className="mt-4 text-sm text-zinc-400">{message}</p>}
            </div>
        </main>
    );
}