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
}

export function TagSelect<T extends string>({
  options,
  selectedOptions,
  onChange,
  className,
  translationPrefix = "",
}: TagSelectProps<T>) {
  const t = useTranslations();

  const toggleOption = (option: T) => {
    if (selectedOptions.includes(option)) {
      onChange(selectedOptions.filter((item) => item !== option));
    } else {
      onChange([...selectedOptions, option]);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => (
        <Button
          key={option}
          variant={selectedOptions.includes(option) ? "default" : "outline"}
          onClick={() => toggleOption(option)}
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
