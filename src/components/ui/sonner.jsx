"use client";

import { Toaster as Sonner } from "sonner";

function Toaster({ ...props }) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-card text-foreground border border-border shadow-toast rounded-2xl p-4",
          description: "text-muted-foreground",
          actionButton: "bg-accent text-accent-foreground rounded-full",
          cancelButton: "bg-secondary text-secondary-foreground rounded-full",
          success: "[&_[data-icon]]:text-accent",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
