"use client";

import { DirectionProvider } from "@radix-ui/react-direction";

export function ClientDirectionProvider({
  children,
  dir,
}: {
  children: React.ReactNode;
  dir: "ltr" | "rtl";
}) {
  return <DirectionProvider dir={dir}>{children}</DirectionProvider>;
}
