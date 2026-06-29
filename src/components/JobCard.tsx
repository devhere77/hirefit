import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ExternalLink, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Job } from "@/lib/types";

export function JobCard({
  job,
  matchPercent,
  onApply,
}: {
  job: Job;
  matchPercent?: number;
  onApply: (job: Job) => void;
}) {
  return (
    <article className="group rounded-xl border border-border bg-card p-5 hover:border-accent/40 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{job.company}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {job.location}
            </span>
            <span>·</span>
            <span>{job.workMode}</span>
            <span>·</span>
            <span>{job.employmentType}</span>
          </div>
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight">{job.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{job.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.tags.slice(0, 6).map((t) => (
              <span
                key={t}
                className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        {typeof matchPercent === "number" && (
          <div className="text-right shrink-0">
            <div className="text-2xl font-semibold text-accent">{matchPercent}%</div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">match</div>
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/jobs/$jobId" params={{ jobId: job.id }} target="_blank" rel="noreferrer">
            View full JD
            <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link to="/jobs/$jobId" params={{ jobId: job.id }} target="_blank" rel="noreferrer">
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            Tailor my resume
          </Link>
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">
          Posted {job.postedDaysAgo}d ago
        </span>
        <Button size="sm" onClick={() => onApply(job)}>
          Apply
          <ExternalLink className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </article>
  );
}