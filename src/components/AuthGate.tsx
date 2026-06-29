import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { currentUser } from "@/lib/auth";

export function AuthGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!currentUser()) {
      navigate({ to: "/auth" });
    } else {
      setReady(true);
    }
  }, [navigate]);
  if (!ready) return null;
  return <>{children}</>;
}