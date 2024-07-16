"use client";

import * as React from "react";
import { LogOut, SettingsIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations, useLocale } from "next-intl";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SettingsDropdown() {
  const t = useTranslations();
  const router = useRouter();

  const handleSignOut = async () => {
    void (await signOut({ redirect: false }));
    toast.success(t("signed_out_success"));
    setTimeout(() => {
      router.replace("/");
    }, 1500);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <SettingsIcon className="absolute h-[1.2rem] w-[1.2rem] transition-all" />
          <span className="sr-only">{t("settings")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleSignOut()}>
          <span className="text-red-">{t("logout")}</span>
          <LogOut className="ms-auto h-5 text-red-700 rtl:rotate-180" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
