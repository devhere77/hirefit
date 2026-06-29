import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Internship";
type WorkMode = "Remote" | "Hybrid" | "On-site";

interface Job {
  id: string;
  company: string;
  source: "Greenhouse" | "Lever" | "Ashby";
  title: string;
  location: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  postedDaysAgo: number;
  tags: string[];
  description: string;
  responsibilities: string[];
  requirements: string[];
  applyUrl: string;
  match?: number;
}

function daysAgo(ts: number): number {
  if (!ts) return 0;
  return Math.max(0, Math.round((Date.now() - ts) / (1000 * 60 * 60 * 24)));
}

function normalizeEmployment(raw: string | undefined): EmploymentType {
  const s = (raw ?? "").toLowerCase().replace(/[\s_-]/g, "");
  if (s.includes("part")) return "Part-time";
  if (s.includes("contract") || s.includes("temp")) return "Contract";
  if (s.includes("intern")) return "Internship";
  return "Full-time";
}

const GREENHOUSE = ["stripe", "figma", "discord", "airbnb", "vercel", "notion"];
const LEVER = ["plaid", "netflix", "shopify"];
const ASHBY = ["openai", "linear", "ramp"];

function stripHtml(html: string): string {
  if (!html) return "";

  let text = html;

  // 1. First round of decoding for fully encoded structural tags (e.g., &lt;p&gt; -> <p>)
  text = text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // 2. Strip out actual XML/HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // 3. Clean up common non-breaking characters and symbols
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

  return text;
}

function inferMode(location: string): WorkMode {
  const l = location.toLowerCase();
  if (l.includes("remote")) return "Remote";
  if (l.includes("hybrid")) return "Hybrid";
  return "On-site";
}

function inferTags(title: string, desc: string): string[] {
  const VOCAB = [
    "React",
    "TypeScript",
    "Node.js",
    "Python",
    "Go",
    "Rust",
    "Java",
    "Kubernetes",
    "AWS",
    "GCP",
    "PostgreSQL",
    "GraphQL",
    "iOS",
    "Android",
    "Swift",
    "Kotlin",
    "Frontend",
    "Backend",
    "Full-stack",
    "Design",
    "Product",
    "Data",
    "ML",
    "AI",
    "DevOps",
    "Security",
    "QA",
  ];
  const hay = (title + " " + desc).toLowerCase();
  return VOCAB.filter((t) => hay.includes(t.toLowerCase())).slice(0, 8);
}

async function fetchGreenhouse(slug: string): Promise<Job[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`;
  const r = await fetch(url);
  if (!r.ok) return [];
  const json = (await r.json()) as {
    jobs: Array<{
      id: number;
      title: string;
      location: { name: string };
      content: string;
      absolute_url: string;
      updated_at: string;
    }>;
  };
  return json.jobs.map((j) => {
    const desc = stripHtml(j.content ?? "");
    return {
      id: `gh-${slug}-${j.id}`,
      company: slug.charAt(0).toUpperCase() + slug.slice(1),
      source: "Greenhouse",
      title: j.title,
      location: j.location?.name ?? "—",
      employmentType: "Full-time",
      workMode: inferMode(j.location?.name ?? ""),
      postedDaysAgo: daysAgo(new Date(j.updated_at).getTime()),
      tags: inferTags(j.title, desc),
      description: desc.slice(0, 1200),
      responsibilities: desc.split(/(?<=\.)\s+/).slice(0, 5),
      requirements: desc.split(/(?<=\.)\s+/).slice(0, 5),
      applyUrl: j.absolute_url,
    };
  });
}

async function fetchLever(slug: string): Promise<Job[]> {
  const url = `https://api.lever.co/v0/postings/${slug}?mode=json`;
  const r = await fetch(url);
  if (!r.ok) return [];
  // Adjusted interface to catch 'description' which contains the HTML string Lever usually delivers
  const arr = (await r.json()) as Array<{
    id: string;
    text: string;
    categories: { location?: string; commitment?: string; team?: string };
    description?: string;
    descriptionPlain?: string;
    hostedUrl: string;
    createdAt: number;
  }>;
  return arr.map((j) => {
    const rawDesc = j.descriptionPlain ?? j.description ?? "";
    const desc = stripHtml(rawDesc);
    return {
      id: `lv-${slug}-${j.id}`,
      company: slug.charAt(0).toUpperCase() + slug.slice(1),
      source: "Lever",
      title: j.text,
      location: j.categories.location ?? "—",
      employmentType: normalizeEmployment(j.categories.commitment),
      workMode: inferMode(j.categories.location ?? ""),
      postedDaysAgo: daysAgo(j.createdAt),
      tags: inferTags(j.text, desc),
      description: desc.slice(0, 1200),
      responsibilities: desc.split(/(?<=\.)\s+/).slice(0, 5),
      requirements: desc.split(/(?<=\.)\s+/).slice(0, 5),
      applyUrl: j.hostedUrl,
    };
  });
}

async function fetchAshby(slug: string): Promise<Job[]> {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${slug}?includeCompensation=false`;
  const r = await fetch(url);
  if (!r.ok) return [];
  // Adjusted interface to fall back to 'description' HTML payload if plain text is missing
  const json = (await r.json()) as {
    jobs?: Array<{
      id: string;
      title: string;
      location: string;
      employmentType?: string;
      description?: string;
      descriptionPlain?: string;
      jobUrl: string;
      publishedDate?: string;
    }>;
  };
  return (json.jobs ?? []).map((j) => {
    const rawDesc = j.descriptionPlain ?? j.description ?? "";
    const desc = stripHtml(rawDesc);
    return {
      id: `as-${slug}-${j.id}`,
      company: slug.charAt(0).toUpperCase() + slug.slice(1),
      source: "Ashby",
      title: j.title,
      location: j.location ?? "—",
      employmentType: normalizeEmployment(j.employmentType),
      workMode: inferMode(j.location ?? ""),
      postedDaysAgo: daysAgo(j.publishedDate ? new Date(j.publishedDate).getTime() : Date.now()),
      tags: inferTags(j.title, desc),
      description: desc.slice(0, 1200),
      responsibilities: desc.split(/(?<=\.)\s+/).slice(0, 5),
      requirements: desc.split(/(?<=\.)\s+/).slice(0, 5),
      applyUrl: j.jobUrl,
    };
  });
}

async function main() {
  console.log("Fetching live jobs from Greenhouse / Lever / Ashby…");
  const results = await Promise.allSettled([
    ...GREENHOUSE.map(fetchGreenhouse),
    ...LEVER.map(fetchLever),
    ...ASHBY.map(fetchAshby),
  ]);

  const all: Job[] = [];
  for (const r of results) if (r.status === "fulfilled") all.push(...r.value);

  // Spread across companies so first 100 isn't dominated by one.
  const byCompany = new Map<string, Job[]>();
  for (const j of all) {
    const list = byCompany.get(j.company) ?? [];
    list.push(j);
    byCompany.set(j.company, list);
  }
  const interleaved: Job[] = [];
  let added = true;
  while (added && interleaved.length < 100) {
    added = false;
    for (const [, list] of byCompany) {
      const next = list.shift();
      if (next) {
        interleaved.push(next);
        added = true;
        if (interleaved.length >= 100) break;
      }
    }
  }

  const out = `// AUTO-GENERATED by scripts/fetch-jobs.ts — do not edit by hand.
import type { Job } from "./types";

export const ALL_JOBS: Job[] = ${JSON.stringify(interleaved, null, 2)};
`;
  const dest = resolve(process.cwd(), "src/lib/jobs-data.generated.ts");
  writeFileSync(dest, out, "utf8");
  console.log(`Wrote ${interleaved.length} jobs → ${dest}`);

  // Step 10: notify n8n so every registered user gets an email about new jobs.
  const webhook = process.env.N8N_WEBHOOK_URL ?? process.env.VITE_N8N_WEBHOOK_URL;
  if (!webhook) {
    console.log("• Skipped n8n notify (set N8N_WEBHOOK_URL to enable).");
    return;
  }
  const summary = interleaved.slice(0, 10).map((j) => ({
    id: j.id,
    title: j.title,
    company: j.company,
    applyUrl: j.applyUrl,
  }));
  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "new-jobs", jobs: summary, total: interleaved.length }),
    });
    console.log(
      res.ok ? "• Notified n8n about new jobs." : `• n8n notify failed: HTTP ${res.status}`,
    );
  } catch (e) {
    console.log(`• n8n notify error: ${e instanceof Error ? e.message : String(e)}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
