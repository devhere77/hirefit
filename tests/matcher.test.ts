import { describe, it, expect } from "vitest";
import { analyzeResume, scoreJob } from "@/lib/matcher";
import type { Job } from "@/lib/types";

const RESUME = `
Jane Doe — Senior Frontend Engineer.
Built apps with React, TypeScript, Next.js and Tailwind.
Tooling: Figma, GitHub, Docker, AWS. Wrote tests with Vitest and Playwright.
AWS Certified Solutions Architect.
`;

const JOB: Job = {
  id: "j1",
  company: "Acme",
  source: "Greenhouse",
  title: "Senior Frontend Engineer",
  location: "Remote",
  employmentType: "Full-time",
  workMode: "Remote",
  postedAt: Date.now(),
  tags: ["React", "TypeScript", "Tailwind", "Frontend"],
  description: "Build polished UIs in React and TypeScript with Tailwind.",
  requirements: ["React", "TypeScript", "Testing with Playwright"],
  applyUrl: "https://example.com/apply/j1",
};

describe("analyzeResume", () => {
  it("extracts tech / tools / certs", () => {
    const r = analyzeResume(RESUME);
    expect(r.techStack).toEqual(expect.arrayContaining(["react", "typescript", "next.js", "tailwind"]));
    expect(r.tools).toEqual(expect.arrayContaining(["figma", "github", "docker", "aws", "vitest", "playwright"]));
    expect(r.certifications).toEqual(expect.arrayContaining(["aws certified"]));
    expect(r.keywords).toEqual(expect.arrayContaining(["frontend"]));
  });
});

describe("scoreJob", () => {
  it("returns a positive match for a relevant resume", () => {
    const r = analyzeResume(RESUME);
    expect(scoreJob(JOB, r)).toBeGreaterThan(30);
  });
  it("returns 0 when resume is empty", () => {
    const r = analyzeResume("");
    expect(scoreJob(JOB, r)).toBe(0);
  });
});