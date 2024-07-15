"use client";

import React, { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import Link from "next/link";
import LogoLight from "../../public/Images/logo_light.png";
import LogoDark from "../../public/Images/logo_dark.png";
import { useTheme } from "next-themes";
import LanguageSwitcher from "@/components/language-switcher";

export function Header() {
  const { theme } = useTheme();
  const [src, setSrc] = useState(LogoLight);

  useEffect(() => {
    setSrc(theme === "light" ? LogoDark : LogoLight);
  }, [theme]);

  return (
    <div className="fixed top-0 grid w-full grid-cols-12">
      <div className="col-span-3 ms-10 flex flex-row items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <Link className="col-start-5 col-end-9" href={"/"}>
        <Image className="grid-s cursor-pointer" src={src} alt="" />
      </Link>
    </div>
  );
}
