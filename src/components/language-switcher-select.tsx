"use client";

import clsx from "clsx";
import { useTransition } from "react";
import { Locale } from "@/i18n-config";
import { setUserLocale } from "@/services/locale";
import { Check, LanguagesIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

type Props = {
  defaultValue: string;
  items: Array<{ value: string; label: string }>;
};

export default function LanguageSwitcherSelect({ defaultValue, items }: Props) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();

  function onChange(value: string) {
    const locale = value as Locale;
    startTransition(() => {
      setUserLocale(locale);
    });
  }

  return (
    <div className="relative">
      <Select defaultValue={defaultValue} onValueChange={onChange}>
        <SelectTrigger
          className={clsx(
            "transition-colors",
            isPending && "pointer-events-none opacity-60",
          )}
        >
          <LanguagesIcon className="h-6 w-6 transition-colors group-hover:text-slate-900" />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem
              key={item.value}
              value={item.value}
              className="flex cursor-default items-center text-base"
            >
              {item.value === "en" ? "🇺🇸 " : "🇮🇱 "}
              {t(`${item.value}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
