export default function PricingPage() {
    return (
        <main className="min-h-screen bg-black p-8 text-white">
            <div className="mx-auto max-w-5xl py-20">
                <div className="text-center">
                    <p className="mb-4 text-zinc-500">
                        Pricing
                    </p>

                    <h1 className="mb-4 text-6xl font-bold">
                        Stop writing meeting notes.
                    </h1>

                    <p className="mx-auto mb-14 max-w-2xl text-zinc-400">
                        Turn client meetings into summaries,
                        action items, risks and follow-up emails
                        in seconds.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-[32px] border border-zinc-800 bg-zinc-900 p-8">
                        <p className="mb-3 text-zinc-400">
                            Free
                        </p>

                        <h2 className="mb-6 text-5xl font-bold">
                            £0
                        </h2>

                        <ul className="space-y-4 text-zinc-300">
                            <li>✓ 3 free generations</li>
                            <li>✓ Meeting summaries</li>
                            <li>✓ Follow-up emails</li>
                            <li>✓ Export .txt</li>
                        </ul>

                        <button className="mt-8 w-full rounded-2xl border border-zinc-700 py-4">
                            Current plan
                        </button>
                    </div>

                    <div className="rounded-[32px] border border-white bg-white p-8 text-black">
                        <p className="mb-3 text-zinc-600">
                            Pro
                        </p>

                        <h2 className="mb-6 text-5xl font-bold">
                            £19/mo
                        </h2>

                        <ul className="space-y-4">
                            <li>✓ Unlimited generations</li>
                            <li>✓ Saved meeting history</li>
                            <li>✓ Priority AI speed</li>
                            <li>✓ Team collaboration</li>
                            <li>✓ Better exports</li>
                        </ul>

                        <button className="mt-8 w-full rounded-2xl bg-black py-4 text-white">
                            Start Pro
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}