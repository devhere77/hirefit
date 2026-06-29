import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Upload, Trash2, Loader2, FileText } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteAccount, getProfile, saveProfile } from "@/lib/auth";
import { parseResumePdf } from "@/lib/resume-parser";
import { toast } from "sonner";
import type { SeekingStatus, UserProfile } from "@/lib/types";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Hirefit" }] }),
  component: () => (
    <AuthGate>
      <ProfilePage />
    </AuthGate>
  ),
});

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  if (!profile) return null;

  function update<K extends keyof UserProfile>(k: K, v: UserProfile[K]) {
    if (!profile) return;
    const next = { ...profile, [k]: v };
    setProfile(next);
    saveProfile(next);
  }

  function onAvatar(file: File) {
    const reader = new FileReader();
    reader.onload = () => update("avatarDataUrl", reader.result as string);
    reader.readAsDataURL(file);
  }

  async function onResume(file: File) {
    setBusy(true);
    try {
      const parsed = await parseResumePdf(file);
      if (!profile) return;
      const next = { ...profile, resume: parsed, resumeFileName: file.name };
      saveProfile(next);
      setProfile(next);
      toast.success("Resume updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to parse PDF");
    } finally {
      setBusy(false);
    }
  }

  function onDelete() {
    deleteAccount();
    toast.success("Account deleted");
    navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>

        {/* Avatar + identity */}
        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-secondary border border-border overflow-hidden flex items-center justify-center text-2xl text-muted-foreground">
                {profile.avatarDataUrl ? (
                  <img
                    src={profile.avatarDataUrl}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (profile.name || profile.email).charAt(0).toUpperCase()
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 cursor-pointer bg-card border border-border rounded-full p-1.5 shadow-sm hover:bg-secondary">
                <Upload className="h-3.5 w-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onAvatar(e.target.files[0])}
                />
              </label>
            </div>
            <div className="text-sm text-muted-foreground">
              <div>{profile.email}</div>
              <div className="text-xs">Upload from your phone, tablet, or desktop.</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name">
              <Input value={profile.name} onChange={(e) => update("name", e.target.value)} />
            </Field>
            <Field label="Job title">
              <Input
                value={profile.jobTitle}
                onChange={(e) => update("jobTitle", e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
              />
            </Field>
            <Field label="Current company">
              <Input
                value={profile.currentCompany}
                onChange={(e) => update("currentCompany", e.target.value)}
              />
            </Field>
            <Field label="Current CTC">
              <Input
                value={profile.currentCtc}
                onChange={(e) => update("currentCtc", e.target.value)}
                placeholder="e.g. $120k"
              />
            </Field>
            <Field label="Expected CTC">
              <Input
                value={profile.expectedCtc}
                onChange={(e) => update("expectedCtc", e.target.value)}
                placeholder="e.g. $150k"
              />
            </Field>
            <Field label="I'm seeking">
              <Select
                value={profile.seeking}
                onValueChange={(v) => update("seeking", v as SeekingStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casually">Casually</SelectItem>
                  <SelectItem value="actively">Actively</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </section>

        {/* Resume */}
        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Resume
          </h2>
          <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-accent" />
              {profile.resumeFileName ?? "No resume uploaded yet"}
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onResume(e.target.files[0])}
              />
              <span className="inline-flex items-center text-sm px-3 py-2 rounded-md border border-border hover:bg-secondary transition">
                {busy ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-1.5" />
                )}
                Update resume (PDF)
              </span>
            </label>
          </div>
        </section>

        {/* Danger zone */}
        <section className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <h2 className="text-sm font-semibold text-destructive">Danger zone</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Permanently delete your account and sign out.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="mt-3">
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes your profile and resume from this device.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Yes, delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
