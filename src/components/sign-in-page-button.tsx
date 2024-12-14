"use client";

import { LoginModal } from "@/components/auth/login-modal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SignInPageButton() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      {!session?.user ? (
        <Button
          className="fixed bottom-10 left-1/2 -translate-x-1/2 font-sans text-2xl"
          variant="expandIcon"
          iconPlacement="right"
          Icon={ArrowRight}
          size="lg"
          onClick={() => setIsLoginModalOpen(true)}
        >
          {t("join")}
        </Button>
      ) : (
        <Link href={"/projects"}>
          <Button
            className="fixed bottom-10 left-1/2 -translate-x-1/2 font-sans text-2xl"
            variant="expandIcon"
            iconPlacement="right"
            Icon={ArrowRight}
            size="lg"
          >
            {t("projects")}
          </Button>
        </Link>
      )}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
