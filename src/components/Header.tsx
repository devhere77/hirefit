import { Link, useNavigate } from "@tanstack/react-router";
import { Briefcase, User, LogOut } from "lucide-react";
import { logoutUser, getProfile } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import type { UserProfile } from "@/lib/types";

export function Header() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  useEffect(() => {
    setProfile(getProfile());
    const onStorage = () => setProfile(getProfile());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return (
    <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Briefcase className="h-4 w-4" />
          </span>
          Hirefit
        </Link>
        <div className="flex items-center gap-2">
          {profile && (
            <span
              className={`hidden sm:inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border ${
                profile.seeking === "actively"
                  ? "border-accent text-accent"
                  : "border-border text-muted-foreground"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  profile.seeking === "actively" ? "bg-accent" : "bg-muted-foreground"
                }`}
              />
              {profile.seeking === "actively" ? "Actively seeking" : "Casually looking"}
            </span>
          )}
          <Button variant="ghost" size="sm" asChild>
            <Link to="/profile">
              <User className="h-4 w-4 mr-1.5" />
              Profile
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logoutUser();
              navigate({ to: "/auth" });
            }}
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
