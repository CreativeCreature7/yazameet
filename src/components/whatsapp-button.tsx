"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface WhatsAppButtonProps {
  phoneNumber: string;
}

export function WhatsAppButton({ phoneNumber }: WhatsAppButtonProps) {
  const t = useTranslations();

  const handleClick = () => {
    const message = encodeURIComponent(t("whatsapp_default_message"));
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <Button
      onClick={handleClick}
      className="h312 fixed bottom-6 z-50 h-12 w-12 rounded-full p-2.5 shadow-lg transition-transform duration-200 hover:scale-110 md:h-16 md:w-16 md:p-2 ltr:right-3 rtl:left-3"
      variant="default"
    >
      <MessageCircle className="h-8 w-8" />
      <span className="sr-only">{t("contact_via_whatsapp")}</span>
    </Button>
  );
}
