import { createFileRoute, notFound, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALL_JOBS } from "@/lib/jobs-data.generated";
import type { Job } from "@/lib/types";
import { getProfile } from "@/lib/auth";
import { tailorResume } from "@/lib/tailor-resume.functions";
import { downloadResumePdf } from "@/lib/pdf-export";
import { notifyN8n } from "@/lib/n8n";
import { toast } from "sonner";
import type { UserProfile } from "@/lib/types";

export const Route = createFileRoute("/jobs/$jobId")({
  loader: ({ params }) => {
    const job = ALL_JOBS.find((j) => j.id === params.jobId);
    if (!job) throw notFound();
    return { job };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.job.title} at ${loaderData.job.company}` : "Job" },
      {
        name: "description",
        content: loaderData ? loaderData.job.description.slice(0, 155) : "",
      },
    ],
  }),
  component: JobPage,
});

function JobPage() {
  const { job } = Route.useLoaderData() as { job: Job };
  const params = useParams({ from: "/jobs/$jobId" });
  void params;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tailoring, setTailoring] = useState(false);
  const tailor = useServerFn(tailorResume);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  async function onTailor() {
    if (!profile?.resume?.rawText) {
      toast.error("Upload your resume from the dashboard first");
      return;
    }
    setTailoring(true);
    try {
      const res = await tailor({
        data: {
          resumeContent: profile.resume.rawText,
          jobTitle: job.title,
          company: job.company,
          jobDescription: `${job.description}\n\nResponsibilities:\n- ${job.responsibilities.join(
            "\n- ",
          )}\n\nRequirements:\n- ${job.requirements.join("\n- ")}`,
          jobKeywords: job.tags,
        },
      });
      downloadResumePdf(res.text, `resume-${job.company}-${job.id}.pdf`);
      toast.success("Tailored resume downloaded");
      // Step 10: deliver the same resume to the user via n8n (email/WhatsApp).
      const delivery = await notifyN8n({
        event: "tailored-resume",
        email: profile.email,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        resumeContent: res.text,
      });
      if (delivery.delivered) {
        toast.success("Resume also sent to your email/WhatsApp");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to tailor resume");
    } finally {
      setTailoring(false);
    }
  }

  async function onApply() {
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
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0">
        <div className="mx-auto max-w-3xl px-6 h-14 flex items-center">
          <Button asChild variant="ghost" size="sm">
            <a href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to jobs
            </a>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="text-xs text-muted-foreground">
          {job.company} · {job.location} · {job.workMode} · {job.employmentType} · via {job.source}
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{job.title}</h1>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.tags.map((t) => (
            <span
              key={t}
              className="text-[11px] px-2 py-0.5 rounded-full bg-secondary border border-border"
            >
              {t}
            </span>
          ))}
        </div>

        <section className="mt-8">
          <p className="text-foreground/90 leading-relaxed">{job.description}</p>
        </section>
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Responsibilities
          </h2>
          <ul className="mt-3 space-y-2 list-disc list-inside text-foreground/90">
            {job.responsibilities.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Requirements
          </h2>
          <ul className="mt-3 space-y-2 list-disc list-inside text-foreground/90">
            {job.requirements.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <div className="mt-10 flex flex-wrap gap-3 sticky bottom-4 bg-card/80 backdrop-blur rounded-xl border border-border p-3">
          <Button
            onClick={onTailor}
            disabled={tailoring}
            variant="outline"
            className="flex-1 min-w-[200px]"
          >
            {tailoring ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {tailoring ? "Tailoring…" : "Tailor my resume with AI"}
          </Button>
          <Button onClick={onApply} className="flex-1 min-w-[200px]">
            Apply on {job.company} site
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
}
