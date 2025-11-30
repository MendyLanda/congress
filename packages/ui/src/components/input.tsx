import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn } from "../lib/utils";

export const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 h-11 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        inverted:
          "border-background text-background focus-visible:border-accent focus-visible:ring-accent/50 aria-invalid:border-[#efa5a5] aria-invalid:text-[#efa5a5]",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
    },
    defaultVariants: {
      variant: "default",
      align: "left",
    },
  },
);

export type InputProps = React.ComponentProps<"input"> &
  VariantProps<typeof inputVariants>;

export function Input({
  className,
  type,
  variant,
  align,
  ...props
}: InputProps) {
  const forceLTR = props.inputMode === "numeric";

  return (
    <input
      type={type}
      data-slot="input"
      dir={forceLTR ? "ltr" : undefined}
      className={cn(inputVariants({ variant, align, className }))}
      {...props}
    />
  );
}
