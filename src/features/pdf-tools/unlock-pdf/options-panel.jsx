"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UnlockPdfOptionsPanel({ options, setOptions }) {
  return (
    <Card className="p-5">
      <Label htmlFor="current-password">Current password</Label>
      <Input
        id="current-password"
        type="password"
        placeholder="Enter the PDF's current password"
        value={options.password || ""}
        onChange={(e) => setOptions({ ...options, password: e.target.value })}
        className="mt-1.5"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        You must know the current password — this tool removes protection you already have rightful
        access to, it can&apos;t bypass an unknown password.
      </p>
    </Card>
  );
}
