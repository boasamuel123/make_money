import Link from "next/link";

const plans = [
    {
        name: "Free",
        price: "£0",
        description: "For testing the product and occasional meeting notes.",
        features: [
            "3 free generations",
            "Meeting summaries",
            "Action items",
            "Follow-up emails",
            "Download .txt reports",
        ],
        cta: "Current plan",
        highlighted: false,
    },
    {
        name: "Pro",
        price: "£19/mo",
        description: "For freelancers, consultants, and small agencies.",
        features: [
            "Unlimited generations",
            "Saved meeting history",
            "Searchable meetings",
            "Client-friendly outputs",
            "Priority improvements",
        ],
        cta: "Start Pro",
        highlighted: true,
    },
    {
        name: "Agency",
        price: "£49/mo",
        description: "For teams managing multiple clients and recurring calls.",
        features: [
            "Everything in Pro",
            "Team workflows",
            "Client-specific history",
            "Weekly digest reports",
            "Priority support",
        ],
        cta: "Contact us",
        highlighted: false,
    },
];

export default function PricingPage() {
    return (
        <main className="min-h-screen bg-black p-8 text-white">
            <div className="mx-auto max-w-6xl animate-fade">
                <div className="mb-10 flex items-center justify-between">
                    <Link
                        href="/"
                        className="button-secondary rounded-xl px-4 py-2 text-sm"
                    >
                        ← Back to App
                    </Link>

                    <Link
                        href="/login"
                        className="button-primary rounded-xl px-4 py-2 text-sm font-semibold"
                    >
                        Login
                    </Link>
                </div>

                <section className="mb-14 text-center">
                    <p className="mb-3 text-sm text-zinc-500">Pricing</p>

                    <h1 className="mx-auto mb-5 max-w-3xl text-5xl font-bold leading-tight">
                        Simple pricing for faster client follow-ups.
                    </h1>

                    <p className="mx-auto max-w-2xl text-zinc-400">
                        Turn meeting transcripts into summaries, decisions, action items,
                        risks, and polished follow-up emails.
                    </p>
                </section>

                <section className="grid gap-6 md:grid-cols-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`card-premium relative rounded-3xl p-6 ${
                                plan.highlighted ? "border-white/60" : ""
                            }`}
                        >
                            {plan.highlighted && (
                                <div className="absolute right-5 top-5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                                    Most popular
                                </div>
                            )}

                            <p className="mb-2 text-sm text-zinc-400">{plan.name}</p>

                            <h2 className="mb-4 text-4xl font-bold">{plan.price}</h2>

                            <p className="mb-6 min-h-12 text-sm text-zinc-400">
                                {plan.description}
                            </p>

                            <ul className="mb-8 space-y-3 text-sm text-zinc-300">
                                {plan.features.map((feature) => (
                                    <li key={feature}>✓ {feature}</li>
                                ))}
                            </ul>

                            <button
                                className={
                                    plan.highlighted
                                        ? "button-primary w-full rounded-2xl py-3 font-semibold"
                                        : "button-secondary w-full rounded-2xl py-3 font-semibold"
                                }
                            >
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </section>

                <section className="mt-12 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 text-center">
                    <h2 className="mb-2 text-xl font-semibold">
                        Not sure yet?
                    </h2>

                    <p className="mb-5 text-zinc-400">
                        Start free and upgrade only when the tool saves you real time.
                    </p>

                    <Link
                        href="/"
                        className="button-primary inline-block rounded-2xl px-6 py-3 font-semibold"
                    >
                        Try it free
                    </Link>
                </section>
            </div>
        </main>
    );
}