import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
    try {
        const { transcript, clientName, meetingType, outputStyle } =
            await req.json();

        if (!transcript) {
            return NextResponse.json(
                { error: "Transcript is required" },
                { status: 400 }
            );
        }

        const response = await openai.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: `
Return ONLY valid JSON.

Format:
{
  "title": "",
  "summary": "",
  "decisions": [],
  "actions": [],
  "risks": [],
  "followupEmail": ""
}
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

        try {
            return NextResponse.json(JSON.parse(raw));
        } catch {
            return NextResponse.json({
                title: "Untitled Meeting",
                summary: raw,
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
                    error instanceof Error
                        ? error.message
                        : "Something went wrong",
            },
            { status: 500 }
        );
    }
}