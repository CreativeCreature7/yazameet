"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { LoadingButton } from "@/components/ui/loading-button";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [showResendSuccess, setShowResendSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn("email", { email, redirect: false });
    setIsEmailSent(true);
    setIsLoading(false);
  };

  const handleResendEmail = async () => {
    await signIn("email", { email, redirect: false });
    setShowResendSuccess(true);
    setTimeout(() => setShowResendSuccess(false), 20000);
  };

  if (isEmailSent) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col gap-4 py-6">
            <Button
              variant="ghost"
              className="absolute top-4 -m-1 flex h-auto w-auto gap-2 p-1 text-muted-foreground ltr:left-4 rtl:right-4"
              onClick={() => setIsEmailSent(false)}
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t("back")}
            </Button>

            <h2 className="text-center text-2xl font-semibold">
              {t("checkInbox")}
            </h2>
            <p className="text-center text-sm text-muted-foreground">
              {t("emailSentTo", { email })}
            </p>

            {showResendSuccess && (
              <div className="flex items-center gap-2 rounded-md bg-green-600 p-2 text-sm text-white">
                <Check className="h-4 w-4" />
                <span>{t("emailSentSuccess")}</span>
              </div>
            )}

            <Button
              variant="default"
              className="w-full"
              onClick={() => window.open("https://gmail.com", "_blank")}
            >
              <img
                src="https://authjs.dev/img/providers/google.svg"
                className="me-2 h-5 w-5"
                alt="Gmail"
              />
              {t("openGmail")}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleResendEmail}
            >
              {t("resendEmail")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex flex-col gap-4 py-6">
          <h2 className="text-center text-2xl font-semibold">
            {t("createAccountOrLogin")}
          </h2>
          <p className="text-center text-sm text-muted-foreground">
            {t("loginBelow")}
          </p>

          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => signIn("google")}
          >
            <img
              src="https://authjs.dev/img/providers/google.svg"
              className="h-5 w-5"
              alt="Google"
            />
            {t("continueWithGoogle")}
          </Button>

          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => signIn("discord")}
          >
            <img
              src="https://authjs.dev/img/providers/discord.svg"
              className="h-5 w-5"
              alt="Discord"
            />
            {t("continueWithDiscord")}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t("orContinueWithEmail")}
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <LoadingButton
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              {t("next")}
            </LoadingButton>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
