import type { HTMLAttributes } from "react";
import { cn } from "@/src/lib/cn";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700",
        className
      )}
      {...props}
    />
  );
}
