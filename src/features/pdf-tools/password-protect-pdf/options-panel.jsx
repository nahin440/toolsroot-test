"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function PasswordProtectPdfOptionsPanel({ options, setOptions }) {
  return (
    <Card className="space-y-5 p-5">
      <div>
        <Label htmlFor="user-password">Password to open the document</Label>
        <Input
          id="user-password"
          type="password"
          placeholder="Required to view the PDF"
          value={options.userPassword || ""}
          onChange={(e) => setOptions({ ...options, userPassword: e.target.value })}
          className="mt-1.5"
        />
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <p className="text-sm font-medium text-foreground">Permissions</p>
        <div className="flex items-center justify-between">
          <Label htmlFor="allow-printing" className="font-normal">
            Allow printing
          </Label>
          <Switch
            id="allow-printing"
            checked={options.permissions?.allowPrinting ?? true}
            onCheckedChange={(v) =>
              setOptions({ ...options, permissions: { ...options.permissions, allowPrinting: v } })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="allow-copying" className="font-normal">
            Allow copying text/images
          </Label>
          <Switch
            id="allow-copying"
            checked={options.permissions?.allowCopying ?? false}
            onCheckedChange={(v) =>
              setOptions({ ...options, permissions: { ...options.permissions, allowCopying: v } })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="allow-modifying" className="font-normal">
            Allow editing
          </Label>
          <Switch
            id="allow-modifying"
            checked={options.permissions?.allowModifying ?? false}
            onCheckedChange={(v) =>
              setOptions({ ...options, permissions: { ...options.permissions, allowModifying: v } })
            }
          />
        </div>
      </div>
    </Card>
  );
}
