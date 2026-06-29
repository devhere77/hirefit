export type N8nPayload =
  | {
      event: "apply";
      email: string;
      phone?: string;
      jobId: string;
      jobTitle: string;
      company: string;
      applyUrl: string;
      matchScore?: number;
    }
  | {
      event: "register";
      email: string;
      name?: string;
    }
  | {
      event: "tailored-resume";
      email: string;
      phone?: string;
      jobId: string;
      jobTitle: string;
      company: string;
      resumeContent: string;
    }
  | {
      event: "new-jobs";
      jobs: Array<{ id: string; title: string; company: string; applyUrl: string }>;
    }
  | {
      event: "delete-account";
      email?: string;
      name?: string;
    };

export async function notifyN8n(
  payload: N8nPayload,
): Promise<{ delivered: boolean; reason?: string }> {
  const url = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;

  if (!url) return { delivered: false, reason: "n8n webhook not configured" };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { delivered: res.ok, reason: res.ok ? undefined : `HTTP ${res.status}` };
  } catch (e) {
    return { delivered: false, reason: e instanceof Error ? e.message : "Network error" };
  }
}
