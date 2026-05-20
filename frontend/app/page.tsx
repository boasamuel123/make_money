"use client";

import { useState } from "react";

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("http://localhost:5001/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setResult(data.result);
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
      <main className="min-h-screen bg-zinc-950 text-white p-6">
        <div className="mx-auto max-w-5xl">
          <header className="mb-10">
            <p className="mb-3 text-sm text-zinc-400">
              Agency AI Operating System
            </p>

            <h1 className="text-4xl font-bold tracking-tight">
              Turn client meetings into action plans.
            </h1>

            <p className="mt-4 max-w-2xl text-zinc-400">
              Paste meeting notes or a transcript. Get a summary, decisions,
              action items, risks, and a client follow-up email.
            </p>
          </header>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <label className="mb-3 block text-sm font-medium text-zinc-300">
                Meeting transcript
              </label>

              <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste your client meeting transcript here..."
                  className="min-h-[420px] w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
              />

              <button
                  onClick={handleGenerate}
                  disabled={!transcript.trim() || loading}
                  className="mt-4 w-full rounded-xl bg-white px-5 py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate action plan"}
              </button>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="mb-3 text-sm font-medium text-zinc-300">
                Output
              </h2>

              <div className="min-h-[480px] whitespace-pre-wrap rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-200">
                {result || "Your generated action plan will appear here."}
              </div>
            </div>
          </section>
        </div>
      </main>
  );
}