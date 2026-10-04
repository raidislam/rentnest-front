"use client";

import { useId } from "react";
import { Search } from "lucide-react";
import { Input, Label } from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Accessible label (visually hidden). */
  label: string;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, label, placeholder, className }: SearchInputProps) {
  const id = useId();
  return (
    <div className={cn("relative", className)}>
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
      <Input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}
