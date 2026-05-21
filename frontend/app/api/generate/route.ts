import { NextResponse } from "next/server";
import OpenAI from "openai";

type ActionItem = {
    task: string;
    owner: string;
};

type GeneratedResult = {
    title: string;
    summary: string;
    decisions: string[];
    actions: ActionItem[];
    risks: string[];
    followupEmail: string;
};

const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

function cleanJson(raw: string) {
    return raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
}

function normalizeResult(data: Partial<GeneratedResult>): GeneratedResult {
    return {
        title: data.title || "Untitled Meeting",
        summary: data.summary || "No summary generated.",
        decisions: Array.isArray(data.decisions) ? data.decisions : [],
        actions: Array.isArray(data.actions) ? data.actions : [],
        risks: Array.isArray(data.risks) ? data.risks : [],
        followupEmail: data.followupEmail || "",
    };
}

export async function POST(req: Request) {
    try {
        const { transcript, clientName, meetingType, outputStyle } =
            await req.json();

        if (!transcript || transcript.trim().length < 20) {
            return NextResponse.json(
                { error: "Please paste a longer meeting transcript." },
                { status: 400 }
            );
        }

        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json(
                { error: "Missing GROQ_API_KEY." },
                { status: 500 }
            );
        }

        const response = await openai.chat.completions.create({
            model: "llama-3.1-8b-instant",
            temperature: 0.2,
            messages: [
                {
                    role: "system",
                    content: `
You are an expert operations assistant for agencies, freelancers, consultants, and client-facing teams.

Your job is to convert messy meeting transcripts into clear operational outputs.

Return ONLY raw valid JSON.
Do NOT use markdown.
Do NOT use triple backticks.
Do NOT add explanation before or after the JSON.

The JSON must match this exact shape:

{
  "title": "short useful meeting title",
  "summary": "one polished paragraph",
  "decisions": ["decision 1", "decision 2"],
  "actions": [
    { "task": "specific action item", "owner": "person or team responsible, or Unassigned" }
  ],
  "risks": ["risk or blocker 1", "risk or blocker 2"],
  "followupEmail": "professional email body"
}

Rules:
- Title must be max 8 words.
- Summary must be 2-4 sentences.
- Decisions must only include actual decisions from the transcript.
- Actions must be specific, practical, and task-based.
- Every action must have "task" and "owner".
- If owner is unclear, use "Unassigned".
- Risks must include blockers, concerns, uncertainty, deadlines, or dependencies.
- Follow-up email must be polished, client-friendly, and ready to send.
- Do not invent facts.
- Do not mention that you are an AI.
- Keep output style consistent with the selected style.
          `,
                },
                {
                    role: "user",
                    content: `
Client name: ${clientName || "Not provided"}
Meeting type: ${meetingType || "Not provided"}
Output style: ${outputStyle || "client-friendly"}

Transcript:
${transcript}
          `,
                },
            ],
        });

        const raw = response.choices[0]?.message?.content || "{}";
        const cleaned = cleanJson(raw);

        try {
            const parsed = JSON.parse(cleaned);
            return NextResponse.json(normalizeResult(parsed));
        } catch {
            return NextResponse.json({
                title: "Untitled Meeting",
                summary:
                    "The AI returned an unstructured response. Please try generating again.",
                decisions: [],
                actions: [],
                risks: [],
                followupEmail: "",
            });
        }
    } catch (error: unknown) {
        console.error(error);

        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : "Something went wrong.",
            },
            { status: 500 }
        );
    }
}