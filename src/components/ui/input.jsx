import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex h-10 w-full min-w-0 rounded-xl border border-input bg-background px-3.5 py-2 text-sm leading-none shadow-sm transition-all outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      size: {
        default: "h-10 px-3.5",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-4",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

function Input({ className, size, ...props }) {
  return (
    <input
      data-slot="input"
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  );
}

export { Input, inputVariants };
