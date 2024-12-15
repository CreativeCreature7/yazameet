"use client";

import React, { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../public/Images/logo.png";
import LanguageSwitcher from "@/components/language-switcher";
import { SettingsDropdown } from "@/components/settings-dropdown";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/auth/login-modal";
import { useTranslations } from "next-intl";

export function Header() {
  const t = useTranslations();
  const { status } = useSession();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <div className="fixed top-0 z-50 grid w-full grid-cols-12 bg-background shadow-xl">
        <div className="col-span-6 ms-6 flex flex-row items-center gap-2 lg:col-span-3 lg:ms-10">
          {status === "authenticated" ? (
            <SettingsDropdown />
          ) : (
            <Button onClick={() => setIsLoginModalOpen(true)}>
              {t("login")}
            </Button>
          )}
          {/* <ThemeToggle /> */}
          <LanguageSwitcher />
        </div>
        <Link className="col-span-6 lg:col-start-5 lg:col-end-9" href={"/"}>
          <Image
            priority={true}
            className="cursor-pointer"
            src={Logo}
            alt="Logo"
          />
        </Link>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
