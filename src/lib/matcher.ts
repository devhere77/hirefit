import type { Job, ParsedResume } from "./types";

// Curated vocabularies for keyword/tech/tool/certification extraction.
const TECH = [
  "react","next.js","nextjs","vue","angular","svelte","typescript","javascript",
  "node.js","nodejs","node","python","go","golang","rust","java","kotlin","swift",
  "swiftui","ruby","rails","php","laravel","c++","c#",".net","scala","elixir",
  "html","css","tailwind","sass","graphql","rest","grpc","webrtc","websockets",
  "postgresql","postgres","mysql","mongodb","redis","dynamodb","snowflake","bigquery",
  "spark","kafka","airflow","dbt","pytorch","tensorflow","llm","llms","transformers",
  "ml","ai","nlp","computer vision",
];
const TOOLS = [
  "figma","sketch","adobe xd","photoshop","illustrator","jira","linear","notion",
  "github","gitlab","docker","kubernetes","terraform","ansible","aws","gcp","azure",
  "cloudflare","vercel","netlify","datadog","sentry","grafana","prometheus",
  "playwright","cypress","selenium","jest","vitest","storybook",
];
const CERTS = [
  "aws certified","azure certified","gcp certified","pmp","cissp","cisa","ckad","cka",
  "scrum master","csm","psm","ccna","ocp","comptia","tensorflow developer",
];
const SOFT_KEYWORDS = [
  "frontend","backend","full stack","full-stack","mobile","ios","android",
  "designer","ui","ux","product","analytics","data","devops","platform","sre",
  "qa","tester","testing","automation","security",
];

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9+#./\- ]/g, " ")
      .split(/\s+/)
      .filter(Boolean),
  );
}

function findInText(text: string, vocab: string[]): string[] {
  const lower = text.toLowerCase();
  const hits = new Set<string>();
  for (const term of vocab) {
    const t = term.toLowerCase();
    // word-boundary-ish match for multi-token and special-char terms
    const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
    if (re.test(lower)) hits.add(term);
  }
  return Array.from(hits);
}

export function analyzeResume(rawText: string): ParsedResume {
  const tokens = tokenize(rawText);
  return {
    rawText,
    keywords: findInText(rawText, SOFT_KEYWORDS).concat(Array.from(tokens).slice(0, 0)),
    techStack: findInText(rawText, TECH),
    tools: findInText(rawText, TOOLS),
    certifications: findInText(rawText, CERTS),
  };
}

export function scoreJob(job: Job, resume: ParsedResume): number {
  const haystack = (
    job.title +
    " " +
    job.tags.join(" ") +
    " " +
    job.description +
    " " +
    job.requirements.join(" ")
  ).toLowerCase();

  const needles = new Set([
    ...resume.techStack,
    ...resume.tools,
    ...resume.certifications,
    ...resume.keywords,
  ]);

  let hits = 0;
  needles.forEach((n) => {
    if (haystack.includes(n.toLowerCase())) hits++;
  });
  if (needles.size === 0) return 0;
  return Math.round((hits / needles.size) * 100);
}
