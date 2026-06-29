import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Briefcase, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser, registerUser, validateEmail, validateName, validatePassword } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Hirefit" },
      { name: "description", content: "Create your Hirefit account or sign in." },
    ],
  }),
  component: AuthPage,
});

function PwRule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] ${ok ? "text-accent" : "text-muted-foreground"}`}
    >
      {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />} {label}
    </span>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [nameErr, setNameErr] = useState<string | null>(null);
  const [formErr, setFormErr] = useState<string | null>(null);

  const rules = {
    len: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    num: /\d/.test(pw),
    sp: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(pw),
  };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(pw);
    const nErr = validateName(name);
    setEmailErr(eErr);
    setPwErr(pErr);
    setNameErr(nErr);
    setFormErr(null);
    if (eErr || pErr) return;
    try {
      if (mode === "register") registerUser(email, pw, name);
      else loginUser(email, pw);
      navigate({ to: "/dashboard" });
    } catch (err) {
      setFormErr(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8 text-lg font-semibold tracking-tight">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Briefcase className="h-4 w-4" />
          </span>
          Hirefit
        </div>
        <div className="rounded-2xl border border-border bg-card shadow-sm p-7">
          <div className="flex gap-1 p-1 rounded-lg bg-secondary mb-6">
            {(["register", "login"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setFormErr(null);
                }}
                className={`flex-1 text-sm py-1.5 rounded-md transition ${
                  mode === m
                    ? "bg-card shadow-sm font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "register" ? "Create account" : "Sign in"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setNameErr(validateName(name))}
                  className="mt-1.5"
                  placeholder="John Doe"
                />
                {nameErr && <p className="mt-1.5 text-xs text-destructive">{nameErr}</p>}
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailErr(validateEmail(email))}
                className="mt-1.5"
                placeholder="you@company.com"
              />
              {emailErr && <p className="mt-1.5 text-xs text-destructive">{emailErr}</p>}
            </div>
            <div>
              <Label htmlFor="pw">Password</Label>
              <Input
                id="pw"
                type="password"
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                onBlur={() => setPwErr(validatePassword(pw))}
                className="mt-1.5"
              />
              {mode === "register" && (
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  <PwRule ok={rules.len} label="8+ chars" />
                  <PwRule ok={rules.upper} label="uppercase" />
                  <PwRule ok={rules.lower} label="lowercase" />
                  <PwRule ok={rules.num} label="number" />
                  <PwRule ok={rules.sp} label="special" />
                </div>
              )}
              {pwErr && <p className="mt-1.5 text-xs text-destructive">{pwErr}</p>}
            </div>
            {formErr && (
              <div className="rounded-md bg-destructive/10 text-destructive text-sm px-3 py-2">
                {formErr}
              </div>
            )}
            <Button type="submit" className="w-full">
              {mode === "register" ? "Create account" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
