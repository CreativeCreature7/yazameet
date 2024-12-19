"use client";

import { useEffect } from "react";
import { LogOut, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations, useLocale } from "next-intl";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function SettingsDropdown() {
  const { data } = useSession();
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
        <Button
          variant="outline"
          size="icon"
          className="border-none hover:bg-transparent"
        >
          <Avatar>
            <AvatarImage
              className="object-cover"
              src={data?.user.image!}
              alt={data?.user.name!}
            />
            <AvatarFallback>
              {data?.user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="sr-only">{t("settings")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <span className="text-red-">{t("settings")}</span>
          <Settings className="ms-auto h-5" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSignOut()}>
          <span>{t("logout")}</span>
          <LogOut className="ms-auto h-5 text-red-700 rtl:rotate-180" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
