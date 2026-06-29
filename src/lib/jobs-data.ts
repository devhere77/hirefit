import type { Job, EmploymentType, WorkMode } from "./types";

// 100 hand-seeded roles across 10 ATS-hosted companies.
// Step 9: real companies host on Greenhouse / Lever / Ashby / Workday.
// These slugs map to actual public ATS endpoints used by the fetch-jobs script.

const COMPANIES: Array<{
  name: string;
  source: Job["source"];
  slug: string;
  baseApply: string;
}> = [
  { name: "Stripe", source: "Greenhouse", slug: "stripe", baseApply: "https://stripe.com/jobs/listing" },
  { name: "Figma", source: "Greenhouse", slug: "figma", baseApply: "https://www.figma.com/careers/job" },
  { name: "Notion", source: "Greenhouse", slug: "notion", baseApply: "https://www.notion.so/careers" },
  { name: "Airbnb", source: "Greenhouse", slug: "airbnb", baseApply: "https://careers.airbnb.com/positions" },
  { name: "Discord", source: "Greenhouse", slug: "discord", baseApply: "https://discord.com/jobs" },
  { name: "OpenAI", source: "Ashby", slug: "openai", baseApply: "https://openai.com/careers" },
  { name: "Linear", source: "Ashby", slug: "linear", baseApply: "https://linear.app/careers" },
  { name: "Vercel", source: "Greenhouse", slug: "vercel", baseApply: "https://vercel.com/careers" },
  { name: "Plaid", source: "Lever", slug: "plaid", baseApply: "https://plaid.com/careers/openings" },
  { name: "Ramp", source: "Ashby", slug: "ramp", baseApply: "https://ramp.com/careers" },
];

const ROLE_TEMPLATES: Array<{
  title: string;
  tags: string[];
  responsibilities: string[];
  requirements: string[];
}> = [
  {
    title: "Senior Frontend Engineer",
    tags: ["React", "TypeScript", "Next.js", "CSS", "Tailwind", "Frontend"],
    responsibilities: [
      "Own end-to-end delivery of customer-facing product surfaces",
      "Drive frontend architecture decisions across the org",
      "Mentor engineers and raise the quality bar on web UI",
    ],
    requirements: [
      "5+ years building production React applications",
      "Strong TypeScript and modern CSS / design systems experience",
      "Track record shipping accessible, performant UIs",
    ],
  },
  {
    title: "Backend Engineer",
    tags: ["Node.js", "PostgreSQL", "AWS", "Backend", "API", "Microservices"],
    responsibilities: [
      "Design and ship scalable backend services",
      "Own database schema, migrations, and performance",
      "Collaborate with product to translate requirements into APIs",
    ],
    requirements: [
      "3+ years backend experience in Node.js, Go, or Python",
      "Comfort with relational databases and SQL performance",
      "Experience operating services in production on AWS or GCP",
    ],
  },
  {
    title: "Full Stack Engineer",
    tags: ["React", "Node.js", "TypeScript", "PostgreSQL", "GraphQL", "Full Stack"],
    responsibilities: [
      "Build features across frontend and backend",
      "Own small services end to end",
      "Partner with design and product on tight iteration loops",
    ],
    requirements: [
      "3+ years full-stack experience",
      "Strong React and TypeScript fundamentals",
      "API design and database modeling experience",
    ],
  },
  {
    title: "UI/UX Designer",
    tags: ["Figma", "UI", "UX", "Design Systems", "Prototyping", "Research"],
    responsibilities: [
      "Design intuitive interfaces for complex workflows",
      "Run usability studies and translate findings into iteration",
      "Contribute to and evolve the design system",
    ],
    requirements: [
      "Portfolio showing shipped product work",
      "Strong Figma and prototyping skills",
      "Experience collaborating with engineering",
    ],
  },
  {
    title: "QA Automation Engineer",
    tags: ["Playwright", "Cypress", "Testing", "QA", "CI/CD", "Tester"],
    responsibilities: [
      "Build and maintain automated end-to-end test suites",
      "Define test strategy across critical user flows",
      "Partner with engineers on quality and release readiness",
    ],
    requirements: [
      "3+ years in test automation",
      "Experience with Playwright, Cypress, or Selenium",
      "Strong scripting in JavaScript or Python",
    ],
  },
  {
    title: "Data Engineer",
    tags: ["Python", "SQL", "Airflow", "dbt", "Spark", "Data"],
    responsibilities: [
      "Build reliable data pipelines and warehouse models",
      "Partner with analytics and ML teams on data contracts",
      "Improve data quality and observability",
    ],
    requirements: [
      "Strong SQL and Python",
      "Experience with Airflow, dbt, or equivalent tooling",
      "Cloud data warehouse experience (Snowflake / BigQuery)",
    ],
  },
  {
    title: "Machine Learning Engineer",
    tags: ["Python", "PyTorch", "ML", "LLMs", "Transformers", "AI"],
    responsibilities: [
      "Ship ML models into production at scale",
      "Own data, training, and evaluation pipelines",
      "Partner with research on applied problems",
    ],
    requirements: [
      "3+ years applied ML experience",
      "Strong Python and PyTorch / TensorFlow",
      "Comfort with distributed training and serving",
    ],
  },
  {
    title: "DevOps / Platform Engineer",
    tags: ["Kubernetes", "Terraform", "AWS", "CI/CD", "Docker", "Platform"],
    responsibilities: [
      "Own cloud infrastructure and developer experience tooling",
      "Build self-serve platforms for application teams",
      "Improve reliability, security, and cost efficiency",
    ],
    requirements: [
      "Production Kubernetes and Terraform experience",
      "Strong scripting (Go, Python, or Bash)",
      "Deep familiarity with one major cloud provider",
    ],
  },
  {
    title: "Mobile Engineer (iOS)",
    tags: ["Swift", "iOS", "SwiftUI", "Mobile", "Xcode"],
    responsibilities: [
      "Build and ship the consumer iOS application",
      "Own architecture decisions for the iOS codebase",
      "Collaborate with design on best-in-class mobile UX",
    ],
    requirements: [
      "3+ years building iOS apps in Swift",
      "Experience with SwiftUI and modern concurrency",
      "Apps shipped to the App Store",
    ],
  },
  {
    title: "Product Manager",
    tags: ["Product", "Strategy", "Roadmap", "Analytics", "PMP"],
    responsibilities: [
      "Own a product area end to end",
      "Define roadmap and align stakeholders",
      "Drive measurable outcomes for customers and the business",
    ],
    requirements: [
      "3+ years product management at a software company",
      "Strong analytical and communication skills",
      "Track record shipping impactful product work",
    ],
  },
];

const LOCATIONS = [
  "San Francisco, CA",
  "New York, NY",
  "Remote",
  "London, UK",
  "Berlin, DE",
  "Bangalore, IN",
  "Toronto, CA",
  "Singapore",
  "Austin, TX",
  "Dublin, IE",
];
const MODES: WorkMode[] = ["Remote", "Hybrid", "On-site"];
const TYPES: EmploymentType[] = ["Full-time", "Full-time", "Full-time", "Contract", "Part-time"];

function seededInt(seed: number, mod: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return Math.floor((x - Math.floor(x)) * mod);
}

function buildJobs(): Job[] {
  const jobs: Job[] = [];
  let i = 0;
  for (const company of COMPANIES) {
    for (const role of ROLE_TEMPLATES) {
      i++;
      const loc = LOCATIONS[seededInt(i, LOCATIONS.length)];
      const mode = loc === "Remote" ? "Remote" : MODES[seededInt(i + 1, MODES.length)];
      const type = TYPES[seededInt(i + 2, TYPES.length)];
      jobs.push({
        id: `${company.slug}-${i}`,
        title: role.title,
        company: company.name,
        location: loc,
        workMode: mode,
        employmentType: type,
        postedDaysAgo: 1 + seededInt(i + 7, 28),
        applyUrl: `${company.baseApply}?ref=lovable&job=${i}`,
        source: company.source,
        tags: role.tags,
        description: `${company.name} is hiring a ${role.title} to join our team. You'll work on the products that millions of customers rely on every day. We value craft, ownership, and clear thinking — and we ship fast.`,
        responsibilities: role.responsibilities,
        requirements: role.requirements,
      });
    }
  }
  return jobs;
}

export const ALL_JOBS: Job[] = buildJobs();
