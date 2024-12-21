"use client";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { useTranslations } from "next-intl";
import { Minus, Plus } from "lucide-react";

interface TagSelectProps<T extends string> {
  options: T[];
  selectedOptions: T[];
  onChange: (selected: T[]) => void;
  className?: string;
  translationPrefix?: string;
  maxSelected?: number;
  variant?: "default" | "counter";
}

export function TagSelect<T extends string>({
  options,
  selectedOptions,
  onChange,
  className,
  translationPrefix = "",
  maxSelected,
  variant = "default",
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

  const handleIncrement = (option: T, e: React.MouseEvent) => {
    e.stopPropagation();
    if (maxSelected && selectedOptions.length >= maxSelected) return;
    onChange([...selectedOptions, option]);
  };

  const handleDecrement = (option: T, e: React.MouseEvent) => {
    e.stopPropagation();
    const index = selectedOptions.lastIndexOf(option);
    if (index === -1) return;
    const newSelected = [...selectedOptions];
    newSelected.splice(index, 1);
    onChange(newSelected);
  };

  const getCount = (option: T) => {
    return selectedOptions.filter((item) => item === option).length;
  };

  if (variant === "counter") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {options.map((option) => {
          const count = getCount(option);
          return (
            <Button
              key={option}
              variant={count > 0 ? "default" : "outline"}
              onClick={() => handleSelect(option)}
              className="group flex h-auto items-center gap-2 border transition-colors"
              size="sm"
              type="button"
            >
              {count > 0 && (
                <button
                  onClick={(e) => handleDecrement(option, e)}
                  className="-ms-3 flex h-8 w-8 items-center justify-center rounded-sm bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20 active:bg-primary-foreground/30"
                  type="button"
                >
                  <Minus className="h-5 w-5" />
                </button>
              )}
              <span className="flex items-center gap-1 py-1.5">
                {t(
                  translationPrefix ? `${translationPrefix}${option}` : option,
                )}
                {count > 0 && (
                  <span className="min-w-[1rem] text-center">({count})</span>
                )}
              </span>
              {count > 0 && (
                <button
                  onClick={(e) => handleIncrement(option, e)}
                  className="-me-3 flex h-8 w-8 items-center justify-center rounded-sm bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20 active:bg-primary-foreground/30"
                  type="button"
                >
                  <Plus className="h-5 w-5" />
                </button>
              )}
            </Button>
          );
        })}
      </div>
    );
  }

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
