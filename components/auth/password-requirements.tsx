import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "One number", test: (v: string) => /\d/.test(v) },
];

/** Live checklist shown under the password field. */
export function PasswordRequirements({ value, id }: { value: string; id?: string }) {
  return (
    <ul id={id} aria-label="Password requirements" className="grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(value);
        return (
          <li key={rule.label} className={cn("flex items-center gap-2", met ? "text-brand-700" : "text-stone-500")}>
            {met ? <Check aria-hidden className="size-4" /> : <Circle aria-hidden className="size-3.5" />}
            {rule.label}
            <span className="sr-only">{met ? "(met)" : "(not met)"}</span>
          </li>
        );
      })}
    </ul>
  );
}
