import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { currentUser } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hirefit — Resume-matched jobs from real career pages" },
      {
        name: "description",
        content:
          "Upload your resume and instantly see matching jobs from real company career pages, with AI resume tailoring.",
      },
      { property: "og:title", content: "Hirefit" },
      {
        property: "og:description",
        content: "Upload your resume. See matching jobs. Tailor with AI.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: currentUser() ? "/dashboard" : "/auth", replace: true });
  }, [navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
      Loading…
    </div>
  );
}
