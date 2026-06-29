import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Upload, Search, X, Loader2, FileText } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { Header } from "@/components/Header";
import { JobCard } from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProfile, saveProfile } from "@/lib/auth";
import { ALL_JOBS } from "@/lib/jobs-data.generated";
import { parseResumePdf } from "@/lib/resume-parser";
import { scoreJob } from "@/lib/matcher";
import { notifyN8n } from "@/lib/n8n";
import { toast } from "sonner";
import type { Job, ParsedResume, UserProfile } from "@/lib/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Hirefit" },
      { name: "description", content: "Your matched jobs and resume." },
    ],
  }),
  component: () => (
    <AuthGate>
      <Dashboard />
    </AuthGate>
  ),
});

const MODE_FILTERS = ["Remote", "Hybrid", "On-site"] as const;
const TYPE_FILTERS = ["Full-time", "Part-time", "Contract"] as const;
const PAGE_SIZE = 10;
const MAX_JOBS = 100;

function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeModes, setActiveModes] = useState<Set<string>>(new Set());
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    if (p?.resume) setResume(p.resume);
  }, []);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const parsed = await parseResumePdf(file);
      setResume(parsed);
      if (profile) {
        const next = { ...profile, resume: parsed, resumeFileName: file.name };
        saveProfile(next);
        setProfile(next);
      }
      toast.success("Resume parsed", {
        description: `${parsed.techStack.length} tech + ${parsed.tools.length} tools detected`,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to parse PDF");
    } finally {
      setUploading(false);
    }
  }

  const filtered = useMemo(() => {
    let list: (Job & { match?: number })[] = ALL_JOBS.slice(0, MAX_JOBS);
    if (resume) {
      list = list
        .map((j) => ({ ...j, match: scoreJob(j, resume) }))
        .sort((a, b) => (b.match ?? 0) - (a.match ?? 0));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.tags.some((t) => t.toLowerCase().includes(q)) ||
          j.description.toLowerCase().includes(q),
      );
    }
    if (activeModes.size) list = list.filter((j) => activeModes.has(j.workMode));
    if (activeTypes.size) list = list.filter((j) => activeTypes.has(j.employmentType));
    return list;
  }, [resume, search, activeModes, activeTypes]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, activeModes, activeTypes, resume]);

  function toggle(set: Set<string>, v: string, setter: (s: Set<string>) => void) {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    setter(next);
  }

  function clearAll() {
    setSearch("");
    setActiveModes(new Set());
    setActiveTypes(new Set());
  }

  async function onApply(job: Job) {
    window.open(job.applyUrl, "_blank", "noreferrer");

    if (!profile) return;

    const res = await notifyN8n({
      event: "apply",
      email: profile.email,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      applyUrl: job.applyUrl,
      matchScore: job.match,
    });

    if (res.delivered) toast.success("We'll email + WhatsApp you about this application");
    else toast.message("Opened company page", { description: "n8n notifications not configured" });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Resume panel */}
        <section className="rounded-2xl border border-border bg-card p-6">
          {resume ? (
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Your resume
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-accent" />
                  {profile?.resumeFileName ?? "resume.pdf"}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5 max-w-2xl">
                  {[...resume.techStack, ...resume.tools, ...resume.certifications]
                    .slice(0, 20)
                    .map((k) => (
                      <span
                        key={k}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20"
                      >
                        {k}
                      </span>
                    ))}
                </div>
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
                <span className="inline-flex items-center text-sm px-3 py-2 rounded-md border border-border hover:bg-secondary transition">
                  <Upload className="h-4 w-4 mr-1.5" />
                  Replace resume
                </span>
              </label>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto h-12 w-12 rounded-xl bg-accent/10 text-accent inline-flex items-center justify-center">
                <Upload className="h-5 w-5" />
              </div>
              <h2 className="mt-3 text-lg font-semibold tracking-tight">Upload your resume</h2>
              <p className="text-sm text-muted-foreground mt-1">
                PDF only. We'll scan your keywords, tech stack, tools and certifications, then match
                you to roles.
              </p>
              <label className="inline-block mt-4 cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
                <span className="inline-flex items-center text-sm px-4 py-2 rounded-md bg-accent text-accent-foreground hover:opacity-90 transition">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-1.5" />
                  )}
                  Choose PDF
                </span>
              </label>
            </div>
          )}
        </section>

        {/* Search + filters */}
        <section className="mt-6 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by role, company, or skill (React, Figma, QA…)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {MODE_FILTERS.map((m) => (
            <FilterChip
              key={m}
              active={activeModes.has(m)}
              onClick={() => toggle(activeModes, m, setActiveModes)}
            >
              {m}
            </FilterChip>
          ))}
          {TYPE_FILTERS.map((t) => (
            <FilterChip
              key={t}
              active={activeTypes.has(t)}
              onClick={() => toggle(activeTypes, t, setActiveTypes)}
            >
              {t}
            </FilterChip>
          ))}
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <X className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        </section>

        <p className="mt-4 text-xs text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "job" : "jobs"}
          {resume && " · ranked by resume match"}
        </p>

        {/* Job list */}
        <section className="mt-3 space-y-3">
          {pageItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No jobs match your filters.
            </div>
          ) : (
            pageItems.map((j) => (
              <JobCard
                key={j.id}
                job={j}
                matchPercent={resume ? (j as Job & { match?: number }).match : undefined}
                onApply={onApply}
              />
            ))
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-6 flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ‹
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-8 w-8 text-sm rounded-md ${
                  n === page
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {n}
              </button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              ›
            </Button>
          </nav>
        )}
      </main>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border transition ${
        active
          ? "bg-accent text-accent-foreground border-accent"
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
