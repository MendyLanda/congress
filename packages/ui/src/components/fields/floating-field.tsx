import type * as React from "react";

import { cn } from "../../lib/utils";

interface FloatingFieldProps {
  label: string;
  htmlFor?: string;
  filled?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Wraps a control with a floating label behavior similar to MUI.
 *
 * Works generically:
 * - For inputs: relies on placeholder=' ' and :placeholder-shown to detect emptiness
 * - For non-input controls (select, date button): pass filled={true} to float the label
 */
export function FloatingField({
  label,
  htmlFor,
  filled = false,
  className,
  children,
}: FloatingFieldProps) {
  return (
    <div
      className={cn("group relative w-full", className)}
      data-filled={filled ? "true" : "false"}
    >
      <label
        htmlFor={htmlFor}
        className={cn(
          "origin-start text-muted-foreground absolute top-1/2 block -translate-y-1/2 cursor-text px-2 text-sm transition-all",
          // Focus within group -> float
          "group-focus-within:text-foreground group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium",
          // If the following input has content (not placeholder-shown) -> float
          "has-[+input:not(:placeholder-shown)]:text-foreground has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium",
          // Generic filled hook for non-input controls
          "group-data-[filled=true]:text-foreground group-data-[filled=true]:pointer-events-none group-data-[filled=true]:top-0 group-data-[filled=true]:cursor-default group-data-[filled=true]:text-xs group-data-[filled=true]:font-medium",
          // For when it's a popover anchor, it will have a sibling with data-state='open' -> float
          "has-[+button[data-state='open']]:text-foreground has-[+button[data-state='open']]:pointer-events-none has-[+button[data-state='open']]:top-0 has-[+button[data-state='open']]:cursor-default has-[+button[data-state='open']]:text-xs has-[+button[data-state='open']]:font-medium",
        )}
      >
        <span className="bg-background inline-flex px-1">{label}</span>
      </label>
      {children}
    </div>
  );
}
