"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleReset() {
        setLoading(true);
        setMessage("");

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage("Check your email for a password reset link.");
        }

        setLoading(false);
    }

    return (
        <main className="min-h-screen bg-black p-8 text-white">
            <div className="mx-auto max-w-md animate-fade">
                <Link
                    href="/login"
                    className="button-secondary mb-8 inline-block rounded-xl px-4 py-2 text-sm"
                >
                    ← Back to login
                </Link>

                <div className="card-premium rounded-3xl p-6">
                    <p className="mb-3 text-sm text-zinc-500">Account recovery</p>

                    <h1 className="mb-4 text-3xl font-bold">Reset your password</h1>

                    <p className="mb-6 text-sm text-zinc-400">
                        Enter your email and we’ll send you a password reset link.
                    </p>

                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        type="email"
                        className="input-premium mb-4 w-full rounded-2xl p-4 text-white outline-none"
                    />

                    <button
                        onClick={handleReset}
                        disabled={!email.trim() || loading}
                        className="button-primary w-full rounded-2xl py-4 font-semibold disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send reset link"}
                    </button>

                    {message && (
                        <p className="mt-4 rounded-2xl border border-zinc-800 bg-black p-3 text-sm text-zinc-400">
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}