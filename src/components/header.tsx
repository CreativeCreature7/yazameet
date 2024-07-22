"use client";

import React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import Link from "next/link";
import LogoLight from "../../public/Images/logo_light.png";
import LogoDark from "../../public/Images/logo_dark.png";
import LanguageSwitcher from "@/components/language-switcher";
import { SettingsDropdown } from "@/components/settings-dropdown";
import { useSession } from "next-auth/react";

export function Header() {
  const { status } = useSession();

  return (
    <div className="fixed top-0 grid w-full grid-cols-12">
      <div className="col-span-3 ms-10 flex flex-row items-center gap-2">
        {status === "authenticated" && <SettingsDropdown />}
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
      <Link className="col-start-5 col-end-9" href={"/"}>
        <Image
          className="grid-s cursor-pointer dark:hidden"
          src={LogoDark}
          alt="Logo"
        />
        <Image
          className="grid-s hidden cursor-pointer dark:block"
          src={LogoLight}
          alt="Logo"
        />
      </Link>
    </div>
  );
}
