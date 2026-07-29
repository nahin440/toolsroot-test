"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HiLockClosed } from "react-icons/hi2";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Reads ?next=/admin/add-blog (set by middleware.js when it redirects an
// unauthenticated visit) once, during the component's first render, rather
// than as a post-mount effect — avoids the extra cascading render an
// effect-based setState would cause. Guarded for SSR, where `window`
// doesn't exist yet: this component renders once on the server (no query
// access, falls back to the default) and then again on the client during
// hydration, where the real value is read.
function getInitialNextPath() {
  if (typeof window === "undefined") return "/admin/add-blog";
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/admin/") ? next : "/admin/add-blog";
}

export default function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nextPath] = useState(getInitialNextPath);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Incorrect password.");
        setSubmitting(false);
        return;
      }

      toast.success("Logged in.");
      router.push(nextPath);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[420px] items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader className="items-center text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-accent-tint text-accent">
            <HiLockClosed className="size-5" />
          </div>
          <CardTitle className="mt-2 text-xl">Admin</CardTitle>
          <CardDescription>Enter the admin password to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                autoFocus
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" variant="accent" className="w-full" disabled={submitting || !password}>
              {submitting ? "Checking..." : "Log in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
