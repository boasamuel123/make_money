"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleUpdatePassword() {
        setLoading(true);
        setMessage("");

        const { error } = await supabase.auth.updateUser({
            password,
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage("Password updated. You can now log in.");
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
                    <p className="mb-3 text-sm text-zinc-500">Set new password</p>

                    <h1 className="mb-4 text-3xl font-bold">Create a new password</h1>

                    <p className="mb-6 text-sm text-zinc-400">
                        Enter your new password below.
                    </p>

                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="New password"
                        type="password"
                        className="input-premium mb-4 w-full rounded-2xl p-4 text-white outline-none"
                    />

                    <button
                        onClick={handleUpdatePassword}
                        disabled={!password.trim() || loading}
                        className="button-primary w-full rounded-2xl py-4 font-semibold disabled:opacity-50"
                    >
                        {loading ? "Updating..." : "Update password"}
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