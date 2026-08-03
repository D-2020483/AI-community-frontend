import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function FormField({ label, icon, size = "lg", className, ...props }) {
  return (
    <Field>
      {label ? (
        <FieldLabel className="text-sm font-medium text-slate-700">
          {label}
        </FieldLabel>
      ) : null}
      <FieldContent>
        <div className="relative">
          {icon ? (
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
              {icon}
            </span>
          ) : null}
          <Input
            size={size}
            className={cn(icon ? "pl-10" : "", className)}
            {...props}
          />
        </div>
      </FieldContent>
    </Field>
  );
}
