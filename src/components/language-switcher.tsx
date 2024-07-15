import { useLocale, useTranslations } from "next-intl";
import LanguageSwitcherSelect from "./language-switcher-select";

export default function LanguageSwitcher() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <LanguageSwitcherSelect
      defaultValue={locale}
      items={[
        {
          value: "en",
          label: t("en"),
        },
        {
          value: "he",
          label: t("he"),
        },
      ]}
    />
  );
}
