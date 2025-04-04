"use client";

import React, { useState, useEffect } from "react";
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
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const t = useTranslations();
  const { status } = useSession();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/projects", label: "projects" },
    { href: "/ideas", label: "ideas.title" },
    { href: "/blog", label: "blog" },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animated nav link
  const NavLink = ({
    href,
    label,
    isActive,
    onClick = () => {},
  }: {
    href: string;
    label: string;
    isActive: boolean;
    onClick?: () => void;
  }) => (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Link
        href={href}
        className={cn(
          "relative text-sm font-medium transition-colors hover:text-primary",
          isActive ? "text-primary" : "text-muted-foreground",
          "after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full",
        )}
        onClick={onClick}
      >
        {t(label)}
      </Link>
    </motion.div>
  );

  return (
    <>
      {/* Announcement banner */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative z-50 flex items-center justify-center bg-primary px-4 py-2 text-primary-foreground"
      >
        <Link
          href="/ideas"
          className="ms-2 text-sm font-medium hover:underline"
        >
          ✨ {t("ideas.banner")} - {t("ideas.click_here")}
        </Link>
      </motion.div>

      {/* Main header */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm transition-all duration-200",
          isScrolled ? "shadow-md" : "",
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                priority
                src={Logo}
                alt="Logo"
                className="h-14 w-auto transition-transform hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);
                return (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    isActive={isActive}
                  />
                );
              })}
            </nav>

            {/* Right Side Items */}
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>

              {status === "authenticated" ? (
                <div className="flex items-center">
                  <SettingsDropdown />
                </div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button onClick={() => setIsLoginModalOpen(true)}>
                    {t("login")}
                  </Button>
                </motion.div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile menu (collapsible) */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden md:hidden"
              >
                <div className="border-t border-border pb-4 pt-3">
                  <nav className="flex flex-col items-center space-y-4">
                    {navLinks.map((link) => {
                      const isActive =
                        pathname === link.href ||
                        pathname.startsWith(`${link.href}/`);
                      return (
                        <NavLink
                          key={link.href}
                          href={link.href}
                          label={link.label}
                          isActive={isActive}
                          onClick={() => setIsMobileMenuOpen(false)}
                        />
                      );
                    })}
                    <div className="pt-2">
                      <LanguageSwitcher />
                    </div>
                  </nav>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
