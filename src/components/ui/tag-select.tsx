"use client";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { useTranslations } from "next-intl";

interface TagSelectProps<T extends string> {
  options: T[];
  selectedOptions: T[];
  onChange: (selected: T[]) => void;
  className?: string;
  translationPrefix?: string;
  maxSelected?: number;
}

export function TagSelect<T extends string>({
  options,
  selectedOptions,
  onChange,
  className,
  translationPrefix = "",
  maxSelected,
}: TagSelectProps<T>) {
  const t = useTranslations();

  const handleSelect = (option: T) => {
    if (selectedOptions.includes(option)) {
      onChange(selectedOptions.filter((selected) => selected !== option));
    } else {
      if (maxSelected && selectedOptions.length >= maxSelected) {
        onChange([option]);
      } else {
        onChange([...selectedOptions, option]);
      }
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => (
        <Button
          key={option}
          variant={selectedOptions.includes(option) ? "default" : "outline"}
          onClick={() => handleSelect(option)}
          className="h-auto border py-1.5 transition-colors"
          size="sm"
          type="button"
        >
          {t(translationPrefix ? `${translationPrefix}${option}` : option)}
        </Button>
      ))}
    </div>
  );
}
