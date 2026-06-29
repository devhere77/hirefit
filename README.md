# Hirefit

Hirefit is an AI-assisted job discovery and application experience for job seekers. It helps candidates upload a resume, discover matching roles from real career pages, view ranked opportunities, tailor their resume for a specific role, and trigger automated follow-up notifications through n8n.

## What Hirefit does

Hirefit combines a polished applicant dashboard with AI-powered matching and resume tailoring. Instead of manually scanning dozens of job boards, candidates can:

- Upload a PDF resume and extract skills, tools, certifications, and experience
- Browse a curated list of jobs ranked by relevance
- Filter jobs by work mode and employment type
- Open a detailed job page with responsibilities and requirements
- Generate a tailored resume for a specific opportunity with AI
- Apply directly and receive workflow-driven notifications

## Use cases

### 1. Job seekers exploring new opportunities

Candidates can upload their resume once and instantly see jobs that match their experience and stack.

### 2. Career switchers and upskilling professionals

Users can quickly identify roles that align with adjacent skills and discover where they fit best.

### 3. Applicants who want faster, smarter applications

Rather than rewriting their resume from scratch for every role, they can tailor it for a target job in one click.

### 4. Automated follow-up and engagement

The app integrates with n8n so that sign-ups, job alerts, applications, and tailored-resume deliveries can trigger email or WhatsApp actions.

## Product flow

1. Sign in or create an account.
2. Upload a resume PDF from the dashboard or profile page.
3. Hirefit parses the document and builds a profile from the extracted information.
4. The job feed is ranked by relevance using the resume content.
5. Users can search, filter, and open job details.
6. On a specific job page, they can tailor their resume with AI and apply directly.
7. The app notifies n8n about key events so the automation workflow can continue.

## Architecture at a glance

- Frontend: React + TypeScript + TanStack Start + Vite
- Styling: Tailwind CSS and shadcn-style UI components
- AI features: resume parsing and resume tailoring
- Automation: n8n webhook-driven workflows
- Data: local profile storage plus generated job data

## Scripts

Run the app locally with:

```bash
bun install
bun run dev
```

Other useful scripts:

```bash
bun run build
bun run test
bun run fetch-jobs
```

The fetch jobs script sends a new-jobs event to the n8n workflow and can be used to distribute job updates to registered users.

## n8n workflow

The project includes an n8n workflow definition in [n8n/job-portal-workflow.json](n8n/job-portal-workflow.json) and supporting notes in [n8n/README.md](n8n/README.md).

The workflow is driven by a single webhook and routes events by type:

- register: triggered when a user signs up
- new-jobs: triggered when the job sync script runs
- apply: triggered when a user applies to a role
- tailored-resume: triggered when AI tailoring is used
- delete-account: triggered when account deletion occurs

### Setup

1. Import the workflow from [n8n/job-portal-workflow.json](n8n/job-portal-workflow.json) into n8n.
2. Copy the production webhook URL.
3. Add it to your environment as:

```bash
VITE_N8N_WEBHOOK_URL=https://your-n8n.example.com/webhook/job-portal
```

4. For the job sync script, export the same URL before running it:

```bash
export N8N_WEBHOOK_URL="https://your-n8n.example.com/webhook/job-portal"
bun run fetch-jobs
```

## Project structure

- [src/routes](src/routes): route-based pages for auth, dashboard, jobs, and profile
- [src/components](src/components): UI and app-level components
- [src/lib](src/lib): matching logic, resume parsing, AI helpers, and n8n integration
- [scripts](scripts): job-fetching and automation scripts
- [n8n](n8n): workflow export and workflow documentation

## Notes

Hirefit is designed as a practical demo and MVP for AI-assisted recruiting workflows. It focuses on the candidate experience while also showing how automation can extend that experience into notifications and follow-up actions.
