import { cn } from "@/lib/cn";

export default function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent",
        className
      )}
    />
  );
}
