import { cn } from "@/lib/utils";

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-xl border border-transparent bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-[color,box-shadow,background] outline-none",
        "focus-visible:bg-background focus-visible:border-border focus-visible:ring-2 focus-visible:ring-ring/40",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-2 aria-invalid:ring-destructive/20 aria-invalid:border-destructive/50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
