"use client";

import { LoginForm } from "@/app/_components/login-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { ClientSafeProvider, LiteralUnion } from "next-auth/react";
import type { BuiltInProviderType } from "next-auth/providers/index";
import { useTranslations } from "next-intl";

type LoginDialogProps = {
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  > | null;
  delayMs?: number;
};

export function LoginDialog({ providers, delayMs = 3500 }: LoginDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const t = useTranslations();

  useEffect(() => {
    if (!session) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, delayMs);

      return () => clearTimeout(timer);
    }
  }, [session, delayMs]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold">{t("login_to_add_project")}</h1>
        </div>
        <LoginForm providers={providers} />
      </DialogContent>
    </Dialog>
  );
}
