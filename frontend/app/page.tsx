"use client";



import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type ActionItem = string | { task?: string; owner?: string };

type Result = {
    title: string;
    summary: string;
    decisions: string[];
    actions: ActionItem[];
    risks: string[];
    followupEmail: string;
    error?: string;
};

type Meeting = {
    id: string;
    createdAt: string;
    userId?: string;
    clientName: string;
    meetingType: string;
    outputStyle: string;
    transcript: string;
    result: Result;
};

export default function Home() {
    const [user, setUser] = useState<User | null>(null);
    const [clientName, setClientName] = useState("");
    const [meetingType, setMeetingType] = useState("");
    const [outputStyle, setOutputStyle] = useState("client-friendly");
    const [transcript, setTranscript] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Result | null>(null);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [freeUses, setFreeUses] = useState(0);


    async function loadMeetings(userId: string) {
        const { data, error } = await supabase
            .from("meetings")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
            return;
        }

        const formatted = data.map((meeting) => ({
            id: meeting.id,
            createdAt: meeting.created_at,
            userId: meeting.user_id,
            clientName: meeting.client_name || "",
            meetingType: meeting.meeting_type || "",
            outputStyle: meeting.output_style || "client-friendly",
            transcript: meeting.transcript,
            result: meeting.result,
        }));

        setMeetings(formatted);
    }

    useEffect(() => {
        const savedUses = localStorage.getItem("freeUses");

        if (savedUses) {
            const parsed = Number(savedUses);

            setTimeout(() => {
                setFreeUses(parsed);
            }, 0);
        }
    }, []);

    useEffect(() => {
        async function getUser() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            setUser(user);

            if (user) {
                await loadMeetings(user.id);
            }
        }

        void getUser();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);

            if (session?.user) {
                void loadMeetings(session.user.id);
            } else {
                setMeetings([]);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    async function saveMeetingToSupabase(
        meeting: Omit<Meeting, "id" | "createdAt">
    ) {
        if (!user) return;

        const { data, error } = await supabase
            .from("meetings")
            .insert({
                user_id: user.id,
                client_name: meeting.clientName,
                meeting_type: meeting.meetingType,
                output_style: meeting.outputStyle,
                transcript: meeting.transcript,
                result: meeting.result,
            })
            .select()
            .single();

        if (error) {
            console.error(error);
            return;
        }

        const formatted: Meeting = {
            id: data.id,
            createdAt: data.created_at,
            userId: data.user_id,
            clientName: data.client_name || "",
            meetingType: data.meeting_type || "",
            outputStyle: data.output_style || "client-friendly",
            transcript: data.transcript,
            result: data.result,
        };

        setMeetings((current) => [formatted, ...current]);
    }

    async function handleGenerate() {
        if (!user && freeUses >= 3) {
            window.location.href = "/pricing";
            return;
        }


        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("https://make-money1-1b3m.onrender.com//generate",  {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    transcript,
                    clientName,
                    meetingType,
                    outputStyle,
                }),
            });

            const data = await res.json();
            setResult(data);

            if (!data.error) {
                if (!user) {
                    const nextUses = freeUses + 1;
                    setFreeUses(nextUses);
                    localStorage.setItem("freeUses", String(nextUses));
                }

                if (user) {
                    await saveMeetingToSupabase({
                        userId: user.id,
                        clientName,
                        meetingType,
                        outputStyle,
                        transcript,
                        result: data,
                    });
                }
            }
        } catch {
            setResult({
                title: "",
                summary: "",
                decisions: [],
                actions: [],
                risks: [],
                followupEmail: "",
                error: "Could not connect to backend.",
            });
        }

        setLoading(false);
    }

    function openMeeting(meeting: Meeting) {
        setClientName(meeting.clientName || "");
        setMeetingType(meeting.meetingType || "");
        setOutputStyle(meeting.outputStyle || "client-friendly");
        setTranscript(meeting.transcript);
        setResult(meeting.result);
    }

    async function deleteMeeting(id: string) {
        if (user) {
            await supabase.from("meetings").delete().eq("id", id);
        }

        setMeetings(meetings.filter((meeting) => meeting.id !== id));
    }

    const filteredMeetings = meetings.filter((meeting) => {
        const text = `
      ${meeting.result.title}
      ${meeting.clientName}
      ${meeting.meetingType}
      ${meeting.result.summary}
    `.toLowerCase();

        return text.includes(searchTerm.toLowerCase());
    });

    const totalMeetings = meetings.length;

    const thisWeekMeetings = meetings.filter((meeting) => {
        const meetingDate = new Date(meeting.createdAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(new Date().getDate() - 7);

        return meetingDate >= sevenDaysAgo;
    }).length;

    const uniqueClients = new Set(
        meetings.map((meeting) => meeting.clientName).filter(Boolean)
    ).size;

    return (
        <main className="min-h-screen bg-black p-8 text-white">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        href="/pricing"
                        className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                    >
                        Pricing
                    </Link>
                    <p className="text-sm text-zinc-500">
                        {user ? `Logged in as ${user.email}` : "Not logged in"}
                    </p>


                    {user ? (
                        <button
                            onClick={() => supabase.auth.signOut()}
                            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                        >
                            Logout
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black"
                        >
                            Login
                        </Link>

                    )}

                </div>


                {!user && (
                    <p className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
                        Free generations used: {freeUses}/3. Login to keep using the app.
                    </p>
                )}

                <p className="mb-3 text-sm text-zinc-500">
                    Agency AI Operating System
                </p>

                <h1 className="mb-4 text-5xl font-bold">
                    Turn client meetings into action plans.
                </h1>

                <p className="mb-10 max-w-2xl text-zinc-400">
                    Paste meeting notes or a transcript. Generate summaries, actions,
                    blockers, and client follow-up emails.
                </p>

                <div className="mb-8 grid gap-4 md:grid-cols-3">
                    <StatCard label="Total meetings" value={totalMeetings} />
                    <StatCard label="This week" value={thisWeekMeetings} />
                    <StatCard label="Clients" value={uniqueClients} />
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr_320px]">
                    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
                        <h2 className="mb-4 font-semibold">Meeting details</h2>

                        <div className="mb-4 grid gap-3 md:grid-cols-3">
                            <input
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="Client name"
                                className="rounded-2xl border border-zinc-700 bg-black p-4 text-white outline-none"
                            />

                            <input
                                value={meetingType}
                                onChange={(e) => setMeetingType(e.target.value)}
                                placeholder="Meeting type"
                                className="rounded-2xl border border-zinc-700 bg-black p-4 text-white outline-none"
                            />

                            <select
                                value={outputStyle}
                                onChange={(e) => setOutputStyle(e.target.value)}
                                className="rounded-2xl border border-zinc-700 bg-black p-4 text-white outline-none"
                            >
                                <option value="concise">Concise</option>
                                <option value="detailed">Detailed</option>
                                <option value="client-friendly">Client-friendly</option>
                                <option value="internal-team">Internal team</option>
                            </select>
                        </div>

                        <h2 className="mb-4 font-semibold">Meeting transcript</h2>

                        <textarea
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            placeholder="Paste your client meeting transcript here..."
                            className="h-[500px] w-full resize-none rounded-2xl border border-zinc-700 bg-black p-4 text-white outline-none"
                        />

                        <div className="mt-4 flex gap-3">
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !transcript.trim()}
                                className="flex-1 rounded-2xl bg-white py-4 font-semibold text-black disabled:opacity-50"
                            >
                                {loading ? "Generating..." : "Generate action plan"}
                            </button>

                            <button
                                onClick={() => {
                                    setClientName("");
                                    setMeetingType("");
                                    setOutputStyle("client-friendly");
                                    setTranscript("");
                                    setResult(null);
                                }}
                                className="rounded-2xl border border-zinc-700 px-5 font-semibold text-zinc-300 hover:bg-zinc-800"
                            >
                                Clear
                            </button>
                        </div>
                    </section>

                    <section className="space-y-4">
                        {loading ? (
                            <>
                                <LoadingCard />
                                <LoadingCard />
                                <LoadingCard />
                                <LoadingCard />
                            </>
                        ) : (
                            <>
                                {result?.error && (
                                    <div className="rounded-3xl border border-red-900 bg-red-950 p-5 text-red-200">
                                        {result.error}
                                    </div>
                                )}

                                {result && !result.error && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => copyText(buildFullReport(result))}
                                            className="rounded-2xl bg-white py-3 font-semibold text-black"
                                        >
                                            Copy full report
                                        </button>

                                        <button
                                            onClick={() => downloadReport(result)}
                                            className="rounded-2xl border border-zinc-700 py-3 font-semibold text-zinc-300 hover:bg-zinc-800"
                                        >
                                            Download .txt
                                        </button>
                                    </div>
                                )}

                                <Card title="Meeting Title" content={result?.title} />
                                <Card title="Meeting Summary" content={result?.summary} />
                                <ListCard title="Decisions Made" items={result?.decisions} />
                                <ListCard title="Action Items" items={result?.actions} />
                                <ListCard title="Risks / Blockers" items={result?.risks} />
                                <Card title="Follow-up Email" content={result?.followupEmail} />
                            </>
                        )}
                    </section>

                    <aside className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
                        <h2 className="mb-4 font-semibold">Recent meetings</h2>

                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search meetings..."
                            className="mb-4 w-full rounded-2xl border border-zinc-700 bg-black p-3 text-sm text-white outline-none"
                        />

                        <div className="space-y-3">
                            {filteredMeetings.length ? (
                                filteredMeetings.map((meeting) => (
                                    <div
                                        key={meeting.id}
                                        className="rounded-2xl border border-zinc-800 bg-black p-4"
                                    >
                                        <button
                                            onClick={() => openMeeting(meeting)}
                                            className="block text-left text-sm font-medium text-zinc-200 hover:text-white"
                                        >
                                            {meeting.result.title || "Untitled meeting"}
                                        </button>

                                        <p className="mt-2 text-xs text-zinc-500">
                                            {meeting.clientName || "No client"} ·{" "}
                                            {meeting.meetingType || "No type"}
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-500">
                                            Style: {meeting.outputStyle || "client-friendly"}
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-500">
                                            {new Date(meeting.createdAt).toLocaleString()}
                                        </p>

                                        <button
                                            onClick={() => deleteMeeting(meeting.id)}
                                            className="mt-3 text-xs text-red-400 hover:text-red-300"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-zinc-500">
                                    Saved meetings will appear here when you are logged in.
                                </p>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}

function copyText(text?: string) {
    if (!text) return;
    void navigator.clipboard.writeText(text);
}

function downloadReport(result: Result | null) {
    if (!result) return;

    const report = buildFullReport(result);
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${result.title || "meeting-report"}.txt`;
    link.click();

    URL.revokeObjectURL(url);
}

function buildFullReport(result: Result | null) {
    if (!result) return "";

    const actions = result.actions
        .map((action) => {
            if (typeof action === "string") return `- ${action}`;

            return `- ${action.task || ""}${
                action.owner ? ` (Owner: ${action.owner})` : ""
            }`;
        })
        .join("\n");

    return `
${result.title}

Meeting Summary
${result.summary}

Decisions Made
${result.decisions.map((item) => `- ${item}`).join("\n")}

Action Items
${actions}

Risks / Blockers
${result.risks.map((item) => `- ${item}`).join("\n")}

Follow-up Email
${result.followupEmail}
  `.trim();
}

function Card({ title, content }: { title: string; content?: string }) {
    return (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{title}</h3>

                <button
                    onClick={() => copyText(content)}
                    className="rounded-lg bg-zinc-800 px-3 py-1 text-sm text-zinc-300 hover:bg-zinc-700"
                >
                    Copy
                </button>
            </div>

            <p className="whitespace-pre-wrap text-zinc-300">
                {content || "No content yet"}
            </p>
        </div>
    );
}

function ListCard({
                      title,
                      items,
                  }: {
    title: string;
    items?: Array<string | { task?: string; owner?: string }>;
}) {
    const normalizedItems =
        items?.map((item) => {
            if (typeof item === "string") return item;

            const task = item.task || "";
            const owner = item.owner ? ` — Owner: ${item.owner}` : "";

            return `${task}${owner}`;
        }) || [];

    const text = normalizedItems.join("\n");

    return (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{title}</h3>

                <button
                    onClick={() => copyText(text)}
                    className="rounded-lg bg-zinc-800 px-3 py-1 text-sm text-zinc-300 hover:bg-zinc-700"
                >
                    Copy
                </button>
            </div>

            <ul className="space-y-2 text-zinc-300">
                {normalizedItems.length ? (
                    normalizedItems.map((item, index) => <li key={index}>• {item}</li>)
                ) : (
                    <li className="text-zinc-500">Nothing yet</li>
                )}
            </ul>
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
    );
}

function LoadingCard() {
    return (
        <div className="animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-4 h-5 w-40 rounded bg-zinc-800" />

            <div className="space-y-3">
                <div className="h-4 rounded bg-zinc-800" />
                <div className="h-4 w-11/12 rounded bg-zinc-800" />
                <div className="h-4 w-8/12 rounded bg-zinc-800" />
            </div>
        </div>
    );
}