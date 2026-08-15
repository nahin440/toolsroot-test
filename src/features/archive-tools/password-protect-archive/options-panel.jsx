"use client";

import { HiOutlineInformationCircle } from "react-icons/hi2";

import { formatBytes } from "@/lib/validation/validate-file";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordProtectArchiveOptionsPanel({ files, options, setOptions }) {
  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-start gap-2.5 rounded-lg bg-secondary/50 p-3.5 text-sm text-muted-foreground">
        <HiOutlineInformationCircle className="mt-0.5 size-4 shrink-0 text-accent-active" />
        <p>
          The output is a .7z file with real AES-256 encryption covering both your files and their
          filenames — a password-protected .zip can&apos;t fully hide its file listing the way .7z can,
          so .7z is what actually keeps everything hidden until the password is entered. Opening it
          needs 7-Zip or another archive tool that supports .7z, which is free and widely available.
        </p>
      </div>

      <div>
        <Label htmlFor="archive-password">Password</Label>
        <Input
          id="archive-password"
          type="password"
          placeholder="Choose a strong password"
          value={options.password || ""}
          onChange={(e) => setOptions({ ...options, password: e.target.value })}
          className="mt-1.5"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          There&apos;s no way to recover a lost password — keep it somewhere safe.
        </p>
      </div>

      <div className="space-y-1.5 border-t border-border pt-3">
        <p className="text-xs font-medium text-muted-foreground">{files.length} file(s) to protect</p>
        {files.slice(0, 5).map((file, i) => (
          <div key={i} className="flex items-center justify-between text-sm text-foreground">
            <span className="truncate">{file.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(file.size)}</span>
          </div>
        ))}
        {files.length > 5 && (
          <p className="text-xs text-muted-foreground">and {files.length - 5} more…</p>
        )}
      </div>
    </Card>
  );
}
