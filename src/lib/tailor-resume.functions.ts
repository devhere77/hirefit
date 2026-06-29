import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { google } from "@ai-sdk/google"; // Swapped out custom gateway for official provider
import { z } from "zod";

const InputSchema = z.object({
  resumeContent: z.string().min(20, "Resume text is too short"),
  jobTitle: z.string().min(1),
  company: z.string().min(1),
  jobDescription: z.string().min(20),
  jobKeywords: z.array(z.string()).default([]),
});

export const tailorResume = createServerFn({ method: "POST" })
  .validator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    // Check for standard Gemini key
    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!key) throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY in environment variables");

    const prompt = [
      "You are an expert resume writer optimizing resumes to pass ATS systems.",
      "Rewrite the candidate's resume below so it aligns with the target job.",
      "Naturally weave in the most relevant keywords from the job description.",
      "Do not fabricate experience. Reorder and rephrase only.",
      "Return ONLY the rewritten resume as plain text with these section headers:",
      "NAME / CONTACT",
      "SUMMARY",
      "SKILLS",
      "EXPERIENCE",
      "EDUCATION",
      "",
      `TARGET ROLE: ${data.jobTitle} at ${data.company}`,
      `KEY JOB KEYWORDS: ${data.jobKeywords.join(", ")}`,
      "",
      "JOB DESCRIPTION:",
      data.jobDescription,
      "",
      "CANDIDATE RESUME:",
      data.resumeContent,
    ].join("\n");

    // Execute directly using the official Gemini model bundle
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
    });

    return { text };
  });
