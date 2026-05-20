import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

app.post("/generate", async (req, res) => {
    try {
        const { transcript } = req.body;

        if (!transcript) {
            return res.status(400).json({ error: "Transcript is required" });
        }

        const response = await openai.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content:
                        "You are an operations assistant for a performance marketing agency. Convert meeting transcripts into: Meeting Summary, Decisions Made, Action Items with suggested owners, Risks / Blockers, and a Professional client follow-up email.",
                },
                {
                    role: "user",
                    content: transcript,
                },
            ],
        });

        return res.json({
            result: response.choices[0]?.message?.content || "No result generated.",
        });
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