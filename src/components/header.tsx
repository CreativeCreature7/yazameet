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
import { usePathname } from "next/navigation";

export function Header() {
  const t = useTranslations();
  const { status } = useSession();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "projects" },
    { href: "/ideas", label: "ideas.title" },
    { href: "/blog", label: "blog" },
  ];

  return (
    <>
      <div className="sticky top-0 z-50 grid w-full grid-cols-12 bg-background shadow-xl">
        <div className="col-span-12 flex items-center justify-center bg-primary px-4 py-2 text-primary-foreground">
          <Link
            href="/ideas"
            className="ms-2 text-sm font-medium hover:underline"
          >
            ✨ {t("ideas.banner")} - {t("ideas.click_here")}
          </Link>
        </div>
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

        <div className="col-span-12 flex justify-center border-t py-3 lg:col-span-12">
          <nav className="flex space-x-6">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {t(link.label)}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
