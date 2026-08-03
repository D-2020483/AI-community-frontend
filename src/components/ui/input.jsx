import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex h-9 w-full min-w-0 rounded-lg border border-input bg-background px-3 py-1 text-sm leading-none shadow-xs transition-all outline-none placeholder:text-muted-foreground focus-visible:border-blue-600 focus-visible:ring-4 focus-visible:ring-blue-600/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      size: {
        default: "h-9 px-3",
        sm: "h-7 px-2 text-xs",
        lg: "h-10 px-3.5",
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
