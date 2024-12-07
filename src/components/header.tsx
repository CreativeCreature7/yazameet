"use client";

import React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../public/Images/logo.png";
import LanguageSwitcher from "@/components/language-switcher";
import { SettingsDropdown } from "@/components/settings-dropdown";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { status } = useSession();

  return (
    <div className="fixed top-0 z-50 grid w-full grid-cols-12 bg-background shadow-xl">
      <div className="col-span-6 ms-6 flex flex-row items-center gap-2 lg:col-span-3 lg:ms-10">
        {status === "authenticated" && <SettingsDropdown />}
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
  );
}
