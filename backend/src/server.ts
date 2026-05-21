import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type"],
    })
);
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});
app.get("/", (_req, res) => {
    res.send("Backend is running");
});

app.get("/health", (_req, res) => {
    res.json({ ok: true });
});
app.get("/cors-test", (_req, res) => {
    res.json({
        message: "cors works",
    });
});

app.post("/generate", async (req, res) => {
    try {
        const { transcript, clientName, meetingType, outputStyle } = req.body;

        if (!transcript) {
            return res.status(400).json({
                error: "Transcript is required",
            });
        }

        const response = await openai.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: `
You are an operations assistant for a performance marketing agency.

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

Rules:
- title = short meeting title, max 6 words
- summary = concise meeting summary
- decisions = array of decisions made
- actions = array of actionable tasks with suggested owners if possible
- risks = array of blockers, concerns, or risks
- followupEmail = professional client follow-up email
- Use the client name and meeting type if provided
- Follow the selected output style:
  - concise = short and direct
  - detailed = more explanation and context
  - client-friendly = polished, warm, and suitable to send to a client
  - internal-team = practical, direct, and useful for internal handoff
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

        let parsed;

        try {
            parsed = JSON.parse(raw);
        } catch {
            parsed = {
                title: "Untitled Meeting",
                summary: raw,
                decisions: [],
                actions: [],
                risks: [],
                followupEmail: "",
            };
        }

        return res.json(parsed);
    } catch (error: any) {
        console.error("Generate error:", error);

        return res.status(500).json({
            error: error?.message || "Something went wrong",
        });
    }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});