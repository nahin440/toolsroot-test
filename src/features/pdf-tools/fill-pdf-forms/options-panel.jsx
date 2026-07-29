"use client";

import { useEffect, useState } from "react";

import { detectFormFields } from "@/lib/engines/pdf/fill-form";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function FillPdfFormsOptionsPanel({ files, options, setOptions }) {
  const [fields, setFields] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    detectFormFields(files[0])
      .then(setFields)
      .catch(() => setLoadError(true));
  }, [files]);

  function setValue(name, value) {
    setOptions({ ...options, values: { ...options.values, [name]: value } });
  }

  if (loadError) {
    return (
      <Card className="p-5 text-sm text-muted-foreground">
        This PDF couldn&apos;t be read as a form. It may not be a valid PDF, or may be corrupted.
      </Card>
    );
  }

  if (!fields) {
    return (
      <Card className="flex items-center justify-center p-8">
        <div className="size-8 animate-pulse rounded-full skeleton-shimmer" />
      </Card>
    );
  }

  if (fields.length === 0) {
    return (
      <Card className="p-5 text-sm text-muted-foreground">
        This PDF doesn&apos;t contain any fillable form fields.
      </Card>
    );
  }

  return (
    <Card className="space-y-4 p-5">
      {fields.map((field) => (
        <div key={field.name}>
          <Label htmlFor={field.name}>{field.name}</Label>
          {field.type === "PDFCheckBox" ? (
            <div className="mt-1.5 flex items-center gap-2">
              <Checkbox
                id={field.name}
                checked={Boolean(options.values?.[field.name])}
                onCheckedChange={(v) => setValue(field.name, v)}
              />
            </div>
          ) : field.type === "PDFDropdown" || field.type === "PDFRadioGroup" ? (
            <Select value={options.values?.[field.name] || ""} onValueChange={(v) => setValue(field.name, v)}>
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Choose an option" />
              </SelectTrigger>
              <SelectContent>
                {(field.options || []).map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={field.name}
              value={options.values?.[field.name] || ""}
              onChange={(e) => setValue(field.name, e.target.value)}
              className="mt-1.5"
            />
          )}
        </div>
      ))}

      <div className="flex items-center justify-between border-t border-border pt-4">
        <Label htmlFor="flatten-form" className="font-normal">
          Flatten form (make non-editable after filling)
        </Label>
        <Switch
          id="flatten-form"
          checked={options.flatten ?? false}
          onCheckedChange={(v) => setOptions({ ...options, flatten: v })}
        />
      </div>
    </Card>
  );
}
